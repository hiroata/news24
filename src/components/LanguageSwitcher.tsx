import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, getLanguagePreference, saveLanguagePreference, LanguageCode } from '../lib/utils/i18n';

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: LanguageCode) => void;
  className?: string;
}

export default function LanguageSwitcher({ onLanguageChange, className = '' }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('ja');
  const [isOpen, setIsOpen] = useState(false);

  // 初期化時に保存された言語設定を読み込む
  useEffect(() => {
    const savedLang = getLanguagePreference();
    setCurrentLang(savedLang);
  }, []);

  const handleLanguageSelect = (lang: LanguageCode) => {
    setCurrentLang(lang);
    saveLanguagePreference(lang);
    setIsOpen(false);
    
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 text-sm"
        aria-label="言語選択"
      >
        <span>{SUPPORTED_LANGUAGES[currentLang].flag}</span>
        <span>{SUPPORTED_LANGUAGES[currentLang].nativeName}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white rounded shadow-lg z-10 py-1 min-w-32">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code as LanguageCode)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 
                ${currentLang === code ? 'bg-gray-100' : ''}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}