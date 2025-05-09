import { generateArticle } from '../../lib/api/generateArticle';
import { AVAILABLE_MODELS } from '../../lib/utils/config';
import { ApiError, getFriendlyErrorMessage, logError } from '../../lib/utils/apiUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }  try {
    const { topic, keywords, sourceUrl, sourceName } = req.body;

    if (!topic) {
      throw new ApiError(400, 'Bad Request', 'Topic is required');
    }
    
    const result = await generateArticle({
      topic,
      keywords: keywords || [],
      sourceUrl,
      sourceName
    });
    
    return res.status(200).json({ 
      success: result.success,
      article: result.article,
      error: result.error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError(error, 'API /api/generate handler'); // エラーログ
    if (error instanceof ApiError) {
      return res.status(error.status).json({ 
        error: error.message, 
        friendlyMessage: getFriendlyErrorMessage(error), // ユーザーフレンドリーなメッセージを追加
        details: error.data 
      });
    }
    // 予期せぬエラー (generateText内で発生したエラーなど)
    return res.status(500).json({ 
      error: 'Failed to generate text',
      friendlyMessage: getFriendlyErrorMessage(error), // ユーザーフレンドリーなメッセージを追加
      message: error.message 
    });
  }
}