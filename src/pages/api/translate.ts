// API Route for translation
import type { NextApiRequest, NextApiResponse } from 'next';
import { GEMINI_API_KEY } from '../../lib/config';
import { ApiError, getFriendlyErrorMessage, logError } from '../../lib/apiUtils'; // logError と getFriendlyErrorMessage をインポート

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLang = 'ja' } = req.body;

    if (!text) {
      // ApiError を使用してエラーを返す
      throw new ApiError(400, 'Bad Request', 'Text is required');
    }

    // 実際の翻訳処理を実装
    // 現在は簡易的な実装ですが、将来的には本格的な翻訳APIを利用する予定
    let translatedText;
    
    try {
      // ここで実際の翻訳APIを呼び出す
      // 例: DeepL、Google Translate API、Geminiなど
      
      // ダミー実装（将来的にはAPIを使用）
      translatedText = await simulateTranslation(text, targetLang);
    } catch (translationError: any) {
      logError(translationError, 'Translation API call'); // エラーログ
      // 翻訳サービス自体のエラーは ApiError でラップして返す
      throw new ApiError(503, 'Service Unavailable', 'Translation service failed', translationError);
    }
    
    return res.status(200).json({ 
      translatedText,
      targetLang,
      originalLength: text.length,
      translatedLength: translatedText.length
    });
  } catch (error: any) {
    logError(error, 'API /api/translate handler'); // エラーログ
    if (error instanceof ApiError) {
      return res.status(error.status).json({ 
        error: error.message, 
        friendlyMessage: getFriendlyErrorMessage(error), // ユーザーフレンドリーなメッセージを追加
        details: error.data 
      });
    }
    // 予期せぬエラー
    return res.status(500).json({ 
      error: 'Failed to translate text',
      friendlyMessage: getFriendlyErrorMessage(error), // ユーザーフレンドリーなメッセージを追加
      message: error.message 
    });
  }
}

// 翻訳APIが完全に実装されるまでのダミー関数
async function simulateTranslation(text: string, targetLang: string): Promise<string> {
  // 実際のAPIを使用する前の一時的な実装
  if (targetLang === 'ja' && !isJapanese(text)) {
    return `[${targetLang}翻訳] ${text}`;
  } else if (targetLang === 'en' && isJapanese(text)) {
    return `[${targetLang} translation] ${text}`;
  }
  
  // 既に対象言語の場合はそのまま返す
  return text;
}

// 日本語かどうかを判定する簡易関数
function isJapanese(text: string): boolean {
  // 日本語の文字コード範囲を検出
  return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
}