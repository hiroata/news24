// クライアント側で利用するAPI呼び出し関数
// サーバーサイドのAPIを安全に呼び出すためのラッパー

const { fetchWithErrorHandling, logError, getFriendlyErrorMessage } = require('../utils/apiUtils');

/**
 * テキスト生成API呼び出しのためのクライアント側ラッパー
 * @param prompt 生成プロンプト
 * @param model 使用モデル名
 * @param maxTokens 最大トークン数
 * @param temperature 温度パラメータ
 * @returns 生成されたテキスト
 */
async function generateTextClient(
  prompt: string,
  model: string = 'grok',
  maxTokens: number = 4000,
  temperature: number = 0.9
): Promise<{ text: string; error?: string }> {
  try {
    const response = await fetchWithErrorHandling('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        maxTokens,
        temperature,
      }),
    });

    const data = await response.json();
    return { text: data.text };
  } catch (error: any) {
    logError(error, 'generateTextClient');
    return { 
      text: '', 
      error: getFriendlyErrorMessage(error)
    };
  }
}

/**
 * 翻訳API呼び出しのためのクライアント側ラッパー
 * @param text 翻訳対象テキスト
 * @param targetLang 対象言語
 * @returns 翻訳されたテキスト
 */
async function translateTextClient(
  text: string,
  targetLang: string = 'ja'
): Promise<{ translatedText: string; error?: string }> {
  try {
    const response = await fetchWithErrorHandling('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang,
      }),
    });

    const data = await response.json();
    return { translatedText: data.translatedText };
  } catch (error: any) {
    logError(error, 'translateTextClient');
    return { 
      translatedText: '', 
      error: getFriendlyErrorMessage(error)
    };
  }
}

/**
 * 音声生成API呼び出しのためのクライアント側ラッパー
 * @param text 音声生成対象テキスト
 * @param voice 音声モデル名
 * @returns 音声URL
 */
async function generateAudioClient(
  text: string,
  voice: string = 'ja-female-1'
): Promise<{ audioUrl: string; error?: string }> {
  try {
    const response = await fetchWithErrorHandling('/api/audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
      }),
    });

    const data = await response.json();
    return { audioUrl: data.audioUrl };
  } catch (error: any) {
    logError(error, 'generateAudioClient');
    return { 
      audioUrl: '', 
      error: getFriendlyErrorMessage(error)
    };
  }
}

module.exports = {
  generateTextClient,
  translateTextClient,
  generateAudioClient
};