/**
 * 特定のトピックに基づいて記事を自動生成する関数
 * 主に手動生成やニュースタイトルからの詳細記事生成に利用
 */
import { generateText } from './grok_api';
import { saveArticle } from '../articles';
import { categorizeArticle, generateSlug } from '../utils/articleUtils';
import { logError } from '../utils/apiUtils';

interface GenerateArticleOptions {
  topic: string;
  keywords?: string[];
  sourceUrl?: string;
  sourceName?: string;
}

/**
 * 記事を生成する
 */
export async function generateArticle(options: GenerateArticleOptions) {
  try {
    console.log(`Generating article about: ${options.topic}`);
    
    // プロンプト作成
    const prompt = `
      あなたは技術記事の執筆者です。以下のトピックについて、
      事実に基づいた情報と専門的な分析を含む記事を作成してください。

      トピック: ${options.topic}
      ${options.keywords ? `キーワード: ${options.keywords.join(', ')}` : ''}

      記事は以下の形式で作成してください:
      1. 記事のタイトル (トピックを反映した魅力的なタイトル)
      2. 記事の本文 (見出しを含むマークダウン形式で、複数のセクションに分割)
      
      正確な情報を提供し、専門用語は適切に説明してください。
      記事の長さは約1000〜1500単語程度にしてください。
    `;
    
    // 記事生成
    const generatedText = await generateText(prompt, "grok-3-latest", 4000, 0.7);
    
    // タイトルと本文を分離
    const lines = generatedText.split('\n');
    let title = '';
    let content = '';
    
    // 最初の行をタイトルとして取得
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#')) {
        title = line.replace(/^["']|["']$/g, ''); // 引用符を削除
        content = lines.slice(i + 1).join('\n');
        break;
      } else if (line && line.startsWith('# ')) {
        title = line.replace(/^# /, '');
        content = lines.slice(i + 1).join('\n');
        break;
      }
    }
    
    if (!title) {
      title = options.topic;
    }
    
    // 記事カテゴリーの決定
    const category = await categorizeArticle(title, content);
    
    // スラッグ生成
    const slug = generateSlug(title);
    
    // 記事データ作成
    const articleData = {
      slug,
      title,
      date: new Date().toISOString(),
      tags: [category].concat(options.keywords || []),
      excerpt: content.split('\n')[0].slice(0, 200) + '...',
      content,
      language: 'ja',
      translatedFrom: null,
      originalUrl: options.sourceUrl || '',
      originalSource: options.sourceName || 'AI生成',
      sourceLanguage: 'ja',
      category,
      coverImage: null,
      readingTime: Math.ceil(content.length / 500)
    };
    
    // 記事の保存
    console.log(`Saving generated article: ${title}`);
    await saveArticle(articleData);
    
    return {
      success: true,
      article: articleData
    };
  } catch (error) {
    logError(error, `Failed to generate article about: ${options.topic}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// コマンドラインから直接実行用
if (require.main === module) {
  const args = process.argv.slice(2);
  const topic = args[0] || 'AIの最新トレンド';
  
  generateArticle({ topic })
    .then(result => {
      if (result.success) {
        console.log(`記事生成完了: ${result.article.title}`);
      } else {
        console.error(`記事生成失敗: ${result.error}`);
      }
    })
    .catch(err => console.error('Error:', err));
}
