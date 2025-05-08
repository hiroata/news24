import React, { useState, useEffect } from "react";
import NovelList from "../components/NovelList";
import TagList from "../components/TagList";
import { getAllNovels, getAllTags } from "../lib/novels";
import type { NovelData } from "../types/novel";
import { LanguageCode, DEFAULT_LANGUAGE, getLanguagePreference } from '../lib/utils/i18n';
import Head from "next/head";
import { fetchWithErrorHandling, getFriendlyErrorMessage } from "../lib/utils/apiUtils";
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
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

  // 検索クエリをクリア
  const clearQuery = () => {
    setQuery("");
  };

  // 全てのフィルターをリセット
  const resetAllFilters = () => {
    setQuery("");
    setSelectedTag(null);
  };

  return (
    <>
      <Head>
        <title>News24 - 最新ニュースと記事</title>
        <meta name="description" content="News24が提供する最新ニュースと記事をお楽しみください。" />
      </Head>

      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-12 -mt-8 mb-12 animate-fade-in">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">News24</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">最新のニュースと記事をお届けします</p>
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-white opacity-70" />
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="キーワード・タグで検索"
                className="w-full py-3 pl-10 pr-12 bg-white/20 backdrop-blur-sm border-white/30 border rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {query && (
                <button 
                  onClick={clearQuery}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container-custom animate-slide-up">
        {/* コントロールパネル */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              記事一覧
            </h2>
            {isLoading && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 animate-pulse-slow">
                読み込み中...
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>フィルター</span>
              {selectedTag && (
                <span className="inline-flex items-center justify-center w-5 h-5 ml-1 bg-primary-500 text-white text-xs rounded-full">
                  1
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* フィルターパネル */}
        {showFilters && (
          <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">人気のタグ:</h3>
              <TagList 
                tags={tags} 
                size="sm"
                className="mb-2"
              />
            </div>
            
            {selectedTag && (
              <div className="flex items-center mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-md p-2">
                <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">選択中のタグ:</span>
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="flex items-center bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 rounded-full px-3 py-1 text-sm"
                  >
                    #{selectedTag}
                    <XMarkIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 検索結果数 */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
          <span>{filtered.length} 件の記事</span>
          
          {(query || selectedTag) && (
            <button 
              onClick={resetAllFilters}
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
            >
              フィルターをクリア
            </button>
          )}
        </div>
        
        {/* 記事リスト */}
        {filtered.length > 0 ? (
          <NovelList novels={filtered} initialViewMode={viewMode} />
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400 mb-2">検索結果がありません</p>
            <button 
              onClick={resetAllFilters}
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              すべての記事を表示
            </button>
          </div>
        )}
      </main>
    </>
  );
}
