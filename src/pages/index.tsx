import React, { useState, useEffect } from "react";
import NovelList from "../components/NovelList";
import TagList from "../components/TagList";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { getAllNovels, getAllTags, NovelData } from "../lib/novels";
import { LanguageCode, DEFAULT_LANGUAGE, getLanguagePreference } from '../lib/utils/i18n';
import Head from "next/head";
import { fetchWithErrorHandling, ApiError, getFriendlyErrorMessage } from "../lib/apiUtils"; // fetchWithErrorHandlingなどをインポート

export async function getStaticProps() {
  // 共通ライブラリ関数を使用
  const novels = getAllNovels();
  const tagCounts = getAllTags();
  const tags = Object.keys(tagCounts);
  
  return { 
    props: { 
      novels,
      tags,
      tagCounts,
    } 
  };
}

interface HomeProps {
  novels: NovelData[];
  tags: string[];
  tagCounts: Record<string, number>;
}

export default function Home({ novels: initialNovels, tags, tagCounts }: HomeProps) {
  const [currentNovels, setCurrentNovels] = useState<NovelData[]>(initialNovels);
  const [query, setQuery] = useState("");
  const [currentLang, setCurrentLang] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // クライアント側で言語設定を読み込み、小説データを更新
  useEffect(() => {
    const preferredLang = getLanguagePreference();
    setCurrentLang(preferredLang);
    if (preferredLang !== DEFAULT_LANGUAGE) {
      fetchNovelsForLanguage(preferredLang);
    }
  }, []);

  const fetchNovelsForLanguage = async (lang: LanguageCode) => {
    setIsLoading(true);
    try {
      const response = await fetchWithErrorHandling(`/api/novels/list?lang=${lang}`);
      const data: NovelData[] = await response.json();
      setCurrentNovels(data);
    } catch (error) {
      console.error("Failed to fetch novels for language:", lang, error);
      // エラー発生時は初期の小説リストに戻すか、エラーメッセージを表示
      setCurrentNovels(initialNovels); 
      alert(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // 検索とタグでフィルタリング
  const filtered = currentNovels.filter((novel: NovelData) => {
    // タグフィルター
    if (selectedTag && !novel.tags.includes(selectedTag)) {
      return false;
    }
    
    // キーワード検索
    if (query) {
      return novel.title.toLowerCase().includes(query.toLowerCase()) || 
             novel.excerpt.toLowerCase().includes(query.toLowerCase()) || 
             novel.tags.some((t: string) => t.toLowerCase().includes(query.toLowerCase()));
    }
    
    return true;
  });
  
  // 言語切り替え処理
  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLang(lang);
    fetchNovelsForLanguage(lang);
  };
  
  // タグ選択処理
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setQuery(""); // タグ選択時は検索ワードをクリア
    }
  };

  return (
    <>
      <Head>
        <title>EroNews Generator - AIが生成する官能小説</title>
        <meta name="description" content="AIが生成する官能小説をお楽しみください。" />
      </Head>

      <main className="max-w-4xl mx-auto py-8 px-4">
        {/* ヘッダーにロゴとサブタイトルを追加 */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <span className="text-4xl">🌸</span>
            <div>
              <h1 className="text-3xl font-bold text-pink-600">EroNews Generator</h1>
              <p className="text-sm text-gray-500 mt-1">AIが生成する官能小説をお楽しみください</p>
            </div>
          </div>
          <LanguageSwitcher onLanguageChange={handleLanguageChange} />
        </header>

        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-lg">読み込み中...</div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            <span className="text-pink-600">Ero</span>News Generator
          </h1>
          
          <LanguageSwitcher 
            onLanguageChange={handleLanguageChange}
          />
        </div>
        
        <div className="mb-8">
          <div className="relative mb-4">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="キーワード・タグで検索"
              className="border px-3 py-2 rounded-md w-full pr-10 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 focus:outline-none"
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="mb-2">
            <h2 className="text-lg font-medium mb-2">人気のタグ:</h2>
            <TagList 
              tags={tags} 
              className={selectedTag ? "opacity-70" : ""}
            />
          </div>
          
          {selectedTag && (
            <div className="flex items-center mt-3 bg-gray-100 rounded-md p-2">
              <span className="mr-2">フィルター:</span>
              <div className="flex-1">
                <button
                  onClick={() => setSelectedTag(null)}
                  className="flex items-center bg-pink-100 text-pink-800 rounded px-2 py-1 text-sm"
                >
                  #{selectedTag}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          {filtered.length} 件の結果
        </div>
        
        {filtered.length > 0 ? (
          <NovelList novels={filtered} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">検索結果がありません</p>
            <button 
              onClick={() => { setQuery(""); setSelectedTag(null); }}
              className="text-pink-600 hover:text-pink-800"
            >
              すべての作品を表示
            </button>
          </div>
        )}
      </main>
    </>
  );
}
