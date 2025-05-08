import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import * as i18n from './utils/i18n';
const { DEFAULT_LANGUAGE } = i18n;

// 小説コンテンツのベースディレクトリ
const NOVELS_DIRECTORY = path.join(process.cwd(), 'src/content/novels');

/**
 * すべての小説のスラッグを取得
 */
function getAllNovelSlugs() {
  try {
    // .mdファイルのみを取得し、言語コード(.ja.md等)がついていないものをベースとする
    const fileNames = fs.readdirSync(NOVELS_DIRECTORY);
    return fileNames
      .filter(fileName => {
        return fileName.endsWith('.md') && 
               !fileName.match(/\.[a-z]{2}\.md$/); // 言語コードがついていないファイル
      })
      .map(fileName => fileName.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error getting novel slugs:', error);
    return [];
  }
}

/**
 * 特定の言語のすべての小説データを取得
 */
function getAllNovels(lang = DEFAULT_LANGUAGE) {
  const slugs = getAllNovelSlugs();
  const allNovelsData = slugs.map(slug => getNovelBySlug(slug, lang))
    .filter(novel => novel !== null);
  
  // 日付順に並べ替え（新しい順）
  return allNovelsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * 特定のスラッグと言語の小説データを取得
 */
function getNovelBySlug(
  slug, 
  lang = DEFAULT_LANGUAGE
) {
  try {
    // 言語に応じたファイル名を生成
    const fileName = lang === DEFAULT_LANGUAGE 
      ? `${slug}.md` 
      : `${slug}.${lang}.md`;
    
    const fullPath = path.join(NOVELS_DIRECTORY, fileName);
    
    // ファイルが存在するか確認
    if (!fs.existsSync(fullPath)) {
      // 指定された言語のファイルがない場合はデフォルト言語で試行
      if (lang !== DEFAULT_LANGUAGE) {
        return getNovelBySlug(slug, DEFAULT_LANGUAGE);
      }
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      excerpt: data.excerpt || content.slice(0, 100), // excerpt自動生成
      content,
      language: lang,
      translatedFrom: lang !== DEFAULT_LANGUAGE ? DEFAULT_LANGUAGE : null, // undefinedの代わりにnullを使用
      audioUrl: data.audioUrl || null, // こちらも念のためnullに変換
      coverImage: data.coverImage || null, // coverImageを追加
      readingTime: data.readingTime || calculateReadingTime(content) // 読書時間を計算
    };
  } catch (error) {
    console.error(`Error reading novel ${slug}:`, error);
    return null;
  }
}

/**
 * コンテンツの文字数から読書時間を概算する（日本語向け）
 * @param {string} content - 小説本文
 * @returns {string} - 読書時間の文字列表現
 */
function calculateReadingTime(content) {
  const wordsPerMinute = 400; // 日本語の場合は文字数ベース
  const characterCount = content.replace(/\s+/g, '').length; // 空白を除外
  const minutes = Math.ceil(characterCount / wordsPerMinute);
  
  if (minutes < 1) {
    return '1分未満';
  } else if (minutes < 60) {
    return `約${minutes}分`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `約${hours}時間${remainingMinutes}分` 
      : `約${hours}時間`;
  }
}

/**
 * タグでフィルタリングした小説データを取得
 */
function getNovelsByTag(
  tag,
  lang = DEFAULT_LANGUAGE
) {
  const allNovels = getAllNovels(lang);
  return allNovels.filter(novel => novel.tags.includes(tag));
}

/**
 * すべてのタグとその記事数を取得
 */
function getAllTags(lang = DEFAULT_LANGUAGE) {
  const novels = getAllNovels(lang);
  const tagCounts = {};
  
  novels.forEach(novel => {
    novel.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return tagCounts;
}

export { getAllNovelSlugs, getAllNovels, getNovelBySlug, getAllTags, getNovelsByTag };