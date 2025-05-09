/**
 * 記事ユーティリティ関数：関連性チェック、カテゴリ分類など
 */
import slugify from 'slugify';
import { generateText } from '../api/grok_api';

/**
 * 記事がAI/テクノロジー関連かどうか判断する
 */
export async function isRelevantTechArticle(title: string, snippet: string): Promise<boolean> {
  // キーワードベースの簡易チェック
  const techKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
    'technology', 'tech', 'software', 'hardware', 'computer', 'computing',
    'digital', 'robot', 'automation', 'autonomous', 'cyber', 'data',
    'quantum', 'innovation', 'startup', 'programming', 'algorithm',
    'blockchain', 'crypto', 'cryptocurrency', 'nft', 'web3', 'metaverse',
    'vr', 'ar', 'xr', 'virtual reality', 'augmented reality',
    'smartphone', 'mobile', 'app', 'cloud', 'security', 'privacy',
    'iot', 'internet of things', '5g', '6g', 'network', 'wireless',
    'semiconductor', 'chip', 'processor', 'gpu', 'cpu', 'microchip'
  ];
  
  const lowerTitle = title.toLowerCase();
  const lowerSnippet = snippet.toLowerCase();
  
  // タイトルとスニペットの両方をチェック
  for (const keyword of techKeywords) {
    if (lowerTitle.includes(keyword) || lowerSnippet.includes(keyword)) {
      return true;
    }
  }
  
  // より複雑なケースには精度を上げるためにAIを活用することも可能
  // ただし、APIコール数を節約するため、キーワードマッチだけで十分な場合が多い
  return false;
}

/**
 * 記事のカテゴリを分類する
 */
export async function categorizeArticle(title: string, content: string): Promise<string> {
  try {
    // 簡易的なキーワードベースのカテゴリ分類
    const categories = {
      'ai': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'gpt', 'llm'],
      'software': ['software', 'app', 'application', 'programming', 'code', 'development', 'framework', 'platform', 'saas'],
      'hardware': ['hardware', 'device', 'gadget', 'computer', 'processor', 'chip', 'semiconductor', 'electronics'],
      'mobile': ['mobile', 'smartphone', 'iphone', 'android', 'app', 'ios', 'cellular', '5g', '6g'],
      'gaming': ['game', 'gaming', 'playstation', 'xbox', 'nintendo', 'console', 'steam'],
      'security': ['security', 'privacy', 'hack', 'breach', 'encryption', 'cyber', 'vulnerability', 'password', 'authentication'],
      'blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'token', 'nft', 'defi', 'dao'],
      'business': ['business', 'startup', 'company', 'enterprise', 'industry', 'corporate', 'investment', 'funding', 'acquisition']
    };
    
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.substring(0, 1000).toLowerCase(); // 最初の1000文字だけチェック
    
    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (lowerTitle.includes(keyword) || lowerContent.includes(keyword)) {
          return category;
        }
      }
    }
    
    // デフォルトカテゴリ
    return 'technology';
  } catch (error) {
    console.error('Error categorizing article:', error);
    return 'technology'; // デフォルトカテゴリ
  }
}

/**
 * スラッグを生成する
 */
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: 'en',
    remove: /[*+~.()'"!:@]/g
  });
}
