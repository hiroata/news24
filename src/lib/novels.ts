import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { LanguageCode, DEFAULT_LANGUAGE, getLocalizedFilename } from './i18n';
import { NovelData } from '../types/novel';

// 小説コンテンツのベースディレクトリ
const NOVELS_DIRECTORY = path.join(process.cwd(), 'src/content/novels');

/**
 * すべての小説のスラッグを取得
 */
export function getAllNovelSlugs(): string[] {
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
export function getAllNovels(lang: LanguageCode = DEFAULT_LANGUAGE): NovelData[] {
  const slugs = getAllNovelSlugs();
  const allNovelsData = slugs.map(slug => getNovelBySlug(slug, lang))
    .filter(novel => novel !== null) as NovelData[];
  
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
export function getNovelBySlug(
  slug: string, 
  lang: LanguageCode = DEFAULT_LANGUAGE
): NovelData | null {
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
      translatedFrom: lang !== DEFAULT_LANGUAGE ? DEFAULT_LANGUAGE : undefined,
      audioUrl: data.audioUrl
    };
  } catch (error) {
    console.error(`Error reading novel ${slug}:`, error);
    return null;
  }
}

/**
 * タグでフィルタリングした小説データを取得
 */
export function getNovelsByTag(
  tag: string,
  lang: LanguageCode = DEFAULT_LANGUAGE
): NovelData[] {
  const allNovels = getAllNovels(lang);
  return allNovels.filter(novel => novel.tags.includes(tag));
}

/**
 * すべてのタグとその記事数を取得
 */
export function getAllTags(lang: LanguageCode = DEFAULT_LANGUAGE): Record<string, number> {
  const novels = getAllNovels(lang);
  const tagCounts: Record<string, number> = {};
  
  novels.forEach(novel => {
    novel.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return tagCounts;
}