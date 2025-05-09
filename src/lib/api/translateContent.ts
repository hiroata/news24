import { generateText } from './grok_api';
import { ApiError, withRetry } from '../utils/apiUtils';

interface TranslationResult {
  translated: string | null;
  error: string | null;
}

/**
 * 記事コンテンツを翻訳する
 * @param text 翻訳対象テキスト
 * @param sourceLanguage 原文の言語
 * @returns 翻訳されたテキストとエラー情報
 */
export async function translateContent(text: string, sourceLanguage: string = 'en'): Promise<TranslationResult> {
  try {
    // テキストが長すぎる場合は分割して処理
    if (text.length > 10000) {
      return await translateLongContent(text, sourceLanguage);
    }
    
    const prompt = `
      あなたは専門的なテクノロジー記事翻訳者です。
      以下の${sourceLanguage}で書かれたテクノロジー記事を、自然で読みやすい日本語に翻訳してください。
      専門用語は適切に翻訳し、必要に応じて原語を括弧内に残してください。
      マークダウン形式を維持し、見出しや箇条書きなどの構造も保持してください。
      
      ### 原文:
      ${text}
      
      ### 翻訳:
    `;
    
    const translatedText = await withRetry(() => 
      generateText(prompt, "grok-3-latest", 12000, 0.7)
    );
    
    return { translated: translatedText, error: null };
  } catch (error) {
    console.error('Translation error:', error);
    return { translated: null, error: error.message };
  }
}

/**
 * 長いコンテンツを分割して翻訳する補助関数
 */
async function translateLongContent(text: string, sourceLanguage: string): Promise<TranslationResult> {
  try {
    // 段落で分割
    const paragraphs = text.split(/\n\s*\n/);
    let translatedParts = [];
    
    // チャンクに分けて処理
    const chunkSize = 5; // 一度に処理する段落数
    
    for (let i = 0; i < paragraphs.length; i += chunkSize) {
      const chunk = paragraphs.slice(i, i + chunkSize).join('\n\n');
      
      const { translated, error } = await translateContent(chunk, sourceLanguage);
      if (error) {
        throw new Error(`Error translating chunk ${i}: ${error}`);
      }
      
      translatedParts.push(translated);
      
      // API制限に配慮して少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { translated: translatedParts.join('\n\n'), error: null };
  } catch (error) {
    return { translated: null, error: error.message };
  }
}
