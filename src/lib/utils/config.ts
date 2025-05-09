// サーバーサイドで利用するAPIキー (環境変数からのみ読み込み、クライアントにエクスポートしない)
export const GROK_API_KEY = process.env.XAI_API_KEY || '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// クライアント側にも公開する設定
// API URL
export const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent";

// モデル設定
export const GROK_MODEL = "grok-3-latest";
export const GEMINI_MODEL = "gemini-2.5-pro-preview-03-25";

// 利用可能なモデルリスト
export const AVAILABLE_MODELS = {
  grok: {
    name: "Grok 3",
    model_id: GROK_MODEL,
    api_module: "grok_api"
  },
  gemini: {
    name: "Gemini 2.5 Pro",
    model_id: GEMINI_MODEL,
    api_module: "gemini_api"
  }
};

// テクノロジーカテゴリ設定
export const TECH_CATEGORIES = {
  ai: "AI・人工知能",
  software: "ソフトウェア",
  hardware: "ハードウェア",
  mobile: "モバイル",
  gaming: "ゲーム",
  security: "セキュリティ",
  blockchain: "ブロックチェーン",
  business: "ビジネス",
  technology: "テクノロジー全般"
};

// ニュースソース情報
export const NEWS_SOURCES = [
  { name: "TechCrunch", icon: "🔶", url: "https://techcrunch.com/" },
  { name: "The Verge", icon: "📱", url: "https://www.theverge.com/" },
  { name: "Wired", icon: "🔌", url: "https://www.wired.com/" },
  { name: "MIT Tech Review", icon: "🧪", url: "https://www.technologyreview.com/" },
  { name: "Engadget", icon: "📡", url: "https://www.engadget.com/" }
];