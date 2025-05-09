import { LanguageCode } from '../lib/utils/i18n';

export interface ArticleData {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  language: LanguageCode;
  translatedFrom?: string | null;
  originalUrl: string;
  originalSource: string;
  sourceLanguage: string;
  coverImage?: string | null;
  readingTime?: number;
  category: string;
}
