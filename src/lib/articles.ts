import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import * as i18n from './utils/i18n';

const { DEFAULT_LANGUAGE } = i18n;

// 記事コンテンツのベースディレクトリ
const ARTICLES_DIRECTORY = path.join(process.cwd(), 'src/content/articles');

/**
 * すべての記事のスラッグを取得
 */
export function getAllArticleSlugs() {
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(ARTICLES_DIRECTORY)) {
    fs.mkdirSync(ARTICLES_DIRECTORY, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(ARTICLES_DIRECTORY)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

/**
 * 特定の言語のすべての記事データを取得
 */
export function getAllArticles(lang = DEFAULT_LANGUAGE, category = null) {
  const slugs = getAllArticleSlugs();
  const articles = slugs
    .map(slug => getArticleBySlug(slug, lang))
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  if (category) {
    return articles.filter(article => article.category === category);
  }
  
  return articles;
}

/**
 * 特定のスラッグと言語の記事データを取得
 */
export function getArticleBySlug(slug, lang = DEFAULT_LANGUAGE) {
  try {
    const fullPath = path.join(ARTICLES_DIRECTORY, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 言語フィルタリング
    if (lang !== DEFAULT_LANGUAGE && data.language !== lang) {
      return null;
    }
    
    return {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      excerpt: data.excerpt || content.slice(0, 150) + '...',
      content,
      language: data.language || lang,
      translatedFrom: data.translatedFrom || null,
      originalUrl: data.originalUrl || '',
      originalSource: data.originalSource || '',
      sourceLanguage: data.sourceLanguage || DEFAULT_LANGUAGE,
      coverImage: data.coverImage || null,
      readingTime: data.readingTime || calculateReadingTime(content),
      category: data.category || 'technology'
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

/**
 * 記事を保存する
 */
export async function saveArticle(articleData) {
  // スラッグが既に存在する場合は上書きしないようにする
  const existingArticle = getArticleBySlug(articleData.slug);
  if (existingArticle) {
    console.log(`Article with slug ${articleData.slug} already exists. Skipping.`);
    return false;
  }
  
  const content = articleData.content;
  delete articleData.content;
  
  const fileContent = matter.stringify(content, articleData);
  
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(ARTICLES_DIRECTORY)) {
    fs.mkdirSync(ARTICLES_DIRECTORY, { recursive: true });
  }
  
  const fullPath = path.join(ARTICLES_DIRECTORY, `${articleData.slug}.md`);
  
  fs.writeFileSync(fullPath, fileContent, 'utf8');
  console.log(`Article saved: ${articleData.title}`);
  return true;
}

/**
 * コンテンツの文字数から読書時間を概算する（日本語向け）
 */
function calculateReadingTime(content) {
  const wordsPerMinute = 500; // 日本語の場合は文字数ベース
  const characterCount = content.replace(/\s+/g, '').length; // 空白を除外
  return Math.ceil(characterCount / wordsPerMinute);
}

/**
 * タグでフィルタリングした記事データを取得
 */
export function getArticlesByTag(tag, lang = DEFAULT_LANGUAGE) {
  const allArticles = getAllArticles(lang);
  return allArticles.filter(article => article.tags.includes(tag));
}

/**
 * カテゴリーでフィルタリングした記事データを取得
 */
export function getArticlesByCategory(category, lang = DEFAULT_LANGUAGE) {
  const allArticles = getAllArticles(lang);
  return allArticles.filter(article => article.category === category);
}

/**
 * すべてのタグとその記事数を取得
 */
export function getAllTags(lang = DEFAULT_LANGUAGE) {
  const articles = getAllArticles(lang);
  const tagCounts = {};
  
  articles.forEach(article => {
    article.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return tagCounts;
}

/**
 * すべてのカテゴリーとその記事数を取得
 */
export function getAllCategories(lang = DEFAULT_LANGUAGE) {
  const articles = getAllArticles(lang);
  const categoryCounts = {};
  
  articles.forEach(article => {
    categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
  });
  
  return categoryCounts;
}
