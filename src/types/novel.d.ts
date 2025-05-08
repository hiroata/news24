// 小説のメタデータと内容の型定義
import { LanguageCode } from '../lib/i18n';

export interface NovelData {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  language: LanguageCode;
  translatedFrom?: string;
  audioUrl?: string;
  coverImage?: string;
  readingTime?: number;
}
