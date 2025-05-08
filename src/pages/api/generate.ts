// API Route for text generation
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateText } from '../../lib/api/grok_api';
import { AVAILABLE_MODELS } from '../../lib/utils/config';
import { ApiError, getFriendlyErrorMessage, logError } from '../../lib/utils/apiUtils'; // logError と getFriendlyErrorMessage をインポート

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'grok', maxTokens = 4000, temperature = 0.9 } = req.body;

    if (!prompt) {
      throw new ApiError(400, 'Bad Request', 'Prompt is required');
    }

    // モデル名の検証
    if (!AVAILABLE_MODELS[model as keyof typeof AVAILABLE_MODELS]) {
      throw new ApiError(400, 'Bad Request', 'Invalid model');
    }

    const generatedText = await generateText(prompt, maxTokens, temperature);
    
    return res.status(200).json({ 
      text: generatedText,
      model: model,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
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