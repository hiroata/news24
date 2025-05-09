import Parser from 'rss-parser';
import cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';
import { translateContent } from './translateContent';
import { saveArticle } from '../articles';
import { isRelevantTechArticle, categorizeArticle, generateSlug } from '../utils/articleUtils';
import { logError, withRetry } from '../utils/apiUtils';
import fetch from 'node-fetch';

const parser = new Parser();

const TECH_SOURCES = [
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", language: "en" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", language: "en" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", language: "en" },
  { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/", language: "en" },
  { name: "Engadget", url: "https://www.engadget.com/rss.xml", language: "en" },
];

interface ArticleItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  categories?: string[];
}

/**
 * 海外テクノロジーニュースを取得して翻訳・保存する
 */
export async function fetchNews() {
  console.log('Starting news fetch process...');
  
  for (const source of TECH_SOURCES) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const feed = await withRetry(() => parser.parseURL(source.url));
      
      for (const item of feed.items.slice(0, 5)) { // 各ソースの最新5記事を処理（デモ用に少なめ）
        try {
          if (await isRelevantTechArticle(item.title || '', item.contentSnippet || '')) {
            console.log(`Processing article: ${item.title}`);
            
            // 記事本文を取得（RSSだけでは短い場合が多いため）
            let fullContent = item.content || item['content:encoded'] || item.contentSnippet || '';
            
            // 本文が短すぎる場合はWebページから取得を試みる
            if (fullContent.length < 1000 && item.link) {
              fullContent = await fetchFullContent(item.link);
            }
            
            await processArticle({
              title: item.title || '',
              link: item.link || '',
              pubDate: item.pubDate || new Date().toISOString(),
              content: fullContent,
              categories: item.categories || [],
            }, source);
            
            // API負荷軽減のため少し待機
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          logError(error, `Error processing article: ${item.title}`);
        }
      }
    } catch (error) {
      logError(error, `Error fetching from ${source.name}`);
    }
  }
  
  console.log('News fetch process completed');
}

/**
 * Webページから記事の本文を取得
 */
async function fetchFullContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // メタタグからの説明を取得
    let metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // 一般的な記事コンテンツセレクタ
    const contentSelectors = [
      'article', '.post-content', '.entry-content', '.article-content',
      '.article-body', '.story-body', '.story-content', '.content-body',
      '[itemprop="articleBody"]', '.post__content', '.post-body'
    ];
    
    // 最も可能性の高いコンテンツコンテナを探す
    let articleContent = '';
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length) {
        // 広告やコメントなどの不要な要素を削除
        element.find('aside, .ad, .advertisement, .social-share, .comments, .related-articles, script, style').remove();
        
        const text = element.html() || '';
        if (text.length > articleContent.length) {
          articleContent = text;
        }
      }
    }
    
    // コンテンツが見つからない場合はbodyの内容を取得
    if (!articleContent) {
      $('header, footer, nav, aside, .sidebar, .ads, .comments').remove();
      articleContent = $('body').html() || '';
    }
    
    // HTMLからテキストに変換
    const textContent = htmlToText(articleContent, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' }
      ]
    });
    
    // メタデータと本文を結合
    return metaDescription + '\n\n' + textContent;
  } catch (error) {
    console.error(`Error fetching full content from ${url}:`, error);
    return '';
  }
}

/**
 * 記事を処理（翻訳・保存）
 */
async function processArticle(article: ArticleItem, source: { name: string, language: string }) {
  try {
    console.log(`Translating article: ${article.title}`);
    
    // 翻訳処理
    const { translated } = await translateContent(
      `# ${article.title}\n\n${article.content}`, 
      source.language
    );
    
    if (!translated) {
      throw new Error("Translation failed");
    }
    
    // タイトルと本文を分離
    const translatedParts = translated.split('\n\n');
    const translatedTitle = translatedParts[0].replace(/^#\s*/, ''); // マークダウン見出しを削除
    const translatedContent = translatedParts.slice(1).join('\n\n');
    
    // 記事データの作成
    const slug = generateSlug(article.title);
    const excerpt = translatedContent.split('\n')[0].slice(0, 200) + '...';
    const category = await categorizeArticle(article.title, article.content);
    
    // カバー画像の取得（本来はここでOGP画像などを取得する）
    const coverImage = null;
    
    const articleData = {
      slug,
      title: translatedTitle,
      originalTitle: article.title,
      date: new Date(article.pubDate).toISOString(),
      tags: [...new Set([...article.categories || [], category])], // 重複を除去
      excerpt,
      content: translatedContent,
      language: 'ja',
      translatedFrom: source.language,
      originalUrl: article.link,
      originalSource: source.name,
      sourceLanguage: source.language,
      category,
      coverImage,
      readingTime: Math.ceil(translatedContent.length / 500) // 日本語の場合は文字数ベース
    };
    
    // 記事の保存
    console.log(`Saving article: ${articleData.title}`);
    await saveArticle(articleData);
    console.log(`Article saved: ${articleData.title}`);
    
  } catch (error) {
    logError(error, `Failed to process article: ${article.title}`);
    throw error;
  }
}

// コマンドラインから直接実行できるようにする
if (require.main === module) {
  fetchNews()
    .then(() => console.log('News fetch completed successfully'))
    .catch(err => console.error('News fetch failed:', err));
}
