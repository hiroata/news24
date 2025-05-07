import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllNovels, NovelData } from '../../../lib/novels';
import { LanguageCode, DEFAULT_LANGUAGE, isValidLang } from '../../../lib/utils/i18n';
import { ApiError, getFriendlyErrorMessage } from '../../../lib/apiUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NovelData[] | { error: string; message?: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let lang = req.query.lang as LanguageCode | undefined;

    if (lang && !isValidLang(lang)) {
      throw new ApiError(400, 'Bad Request', 'Invalid language code provided.');
    }
    if (!lang) {
      lang = DEFAULT_LANGUAGE;
    }

    const novels = getAllNovels(lang);
    return res.status(200).json(novels);

  } catch (error: any) {
    console.error('API Error getting novels:', error);
    if (error instanceof ApiError) {
      return res.status(error.status).json({ 
        error: error.message,
        message: getFriendlyErrorMessage(error)
      });
    }
    return res.status(500).json({ 
      error: 'Failed to fetch novels',
      message: getFriendlyErrorMessage(error)
    });
  }
}
