// 多言語対応のためのユーティリティと定数

// 対応言語リスト
export const SUPPORTED_LANGUAGES = {
  'ja': {
    name: '日本語',
    nativeName: '日本語',
    code: 'ja',
    flag: '🇯🇵',
    dir: 'ltr',  // 文字の方向 (left-to-right)
  },
  'en': {
    name: '英語',
    nativeName: 'English',
    code: 'en',
    flag: '🇺🇸',
    dir: 'ltr',
  },
  'zh': {
    name: '中国語',
    nativeName: '中文',
    code: 'zh',
    flag: '🇨🇳',
    dir: 'ltr',
  },
  'fr': {
    name: 'フランス語',
    nativeName: 'Français',
    code: 'fr',
    flag: '🇫🇷',
    dir: 'ltr',
  },
  'de': {
    name: 'ドイツ語',
    nativeName: 'Deutsch',
    code: 'de',
    flag: '🇩🇪',
    dir: 'ltr',
  },
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// デフォルト言語
export const DEFAULT_LANGUAGE: LanguageCode = 'ja';

// ブラウザの言語設定から対応言語を取得する関数
export function getBrowserLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  
  const browserLang = navigator.language.split('-')[0];
  
  // 対応言語かどうかチェック
  return (browserLang in SUPPORTED_LANGUAGES) 
    ? browserLang as LanguageCode
    : DEFAULT_LANGUAGE;
}

// 言語設定をローカルストレージに保存する関数
export function saveLanguagePreference(lang: LanguageCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLanguage', lang);
  }
}

// ローカルストレージから言語設定を取得する関数
export function getLanguagePreference(): LanguageCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  
  const savedLang = localStorage.getItem('preferredLanguage') as LanguageCode;
  return savedLang && savedLang in SUPPORTED_LANGUAGES ? savedLang : getBrowserLanguage();
}

// 言語コードに基づいてファイル名を生成する関数
export function getLocalizedFilename(baseName: string, lang: LanguageCode): string {
  if (lang === DEFAULT_LANGUAGE) {
    return baseName;
  }
  return `${baseName}.${lang}`;
}