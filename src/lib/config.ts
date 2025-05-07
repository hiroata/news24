// サーバーサイドで利用するAPIキー (環境変数からのみ読み込み、クライアントにエクスポートしない)
const GROK_API_KEY = process.env.XAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

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

// 文体設定（例）
export const WRITING_STYLES = {
  murakami: "村上龍のような都会的で生々しい描写と冷静な語り口...",
  dan: "団鬼六のようなSM描写に特化した...",
  eromanga: "日本のエロ同人マンガのような過激で卑猥な表現...",
  tanizaki: "谷崎潤一郎のような官能的で耽美的な文体...",
  matayoshi: "又吉直樹のような現代的で鋭い観察眼と内省的な文体...",
  higashino: "東野圭吾のような伏線と謎が絡み合う緻密な文体..."
};

// 淫語セリフパターン（例）
export const EROTIC_DIALOG_PATTERNS = {
  ahe: ["「あぁっ…ん゛っ、ン゛ッ…！そこぉっ…！」"],
  beg: ["「お願いぃ…もっと、もっと激しくぅ…！」"],
  shame: ["「こんな場所でぇ…見られたら終わりなのにぃ…！」"],
  dom: ["「このドスケベマンコ、俺のチンポで完全調教してやるよ…！」"],
  sub: ["「はいぃ…私はご主人様の専用肉便器ですぅ…！」"],
  positive: ["「あぁっ、最高ぅっ…！チンポがマンコを抉ってきてぇ…！」"],
  onomatopoeia: ["「ズチュッ、ズチュッ…！チンポがマンコをかき回してぇ…！」"]
};

// サーバーサイドでのみ利用するAPIキーをエクスポート
// この方法だとNext.jsではサーバーサイドコンポーネントやAPIルートでのみ利用可能になる
export { GROK_API_KEY, GEMINI_API_KEY };