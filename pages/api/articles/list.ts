import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllArticles, getArticlesByTag } from '../../../lib/articles';
import { isValidLang, LanguageCode } from '../../../lib/utils/i18n';
import { ApiError } from '../../../lib/utils/apiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { lang, tag } = req.query;
    
    // 言語のバリデーション
    if (lang && typeof lang === 'string' && !isValidLang(lang)) {
      throw new ApiError(400, 'Invalid Language', '指定された言語はサポートされていません');
    }
    
    // タグ指定がある場合はタグでフィルタリング
    let articles;
    if (tag && typeof tag === 'string') {
      articles = getArticlesByTag(tag, lang as LanguageCode | undefined);
    } else {
      articles = getAllArticles(lang as LanguageCode | undefined);
    }
    
    res.status(200).json(articles);
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof ApiError) {
      res.status(error.status).json({
        error: error.statusText,
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
    }
  }
}
