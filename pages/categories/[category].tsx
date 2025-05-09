import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { getArticlesByCategory, getAllCategories } from "../../lib/articles";
import type { ArticleData } from "../../types/article";
import { DEFAULT_LANGUAGE, LanguageCode } from "../../lib/utils/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ArticleList from "../../components/ArticleList";
import CategoryNav from "../../components/CategoryNav";
import { ArrowLeftIcon, FolderIcon } from '@heroicons/react/24/outline';

export const getStaticPaths: GetStaticPaths = async () => {
  // カテゴリ一覧を取得
  const categories = getAllCategories();
  const paths = Object.keys(categories).map((category) => ({ params: { category } }));
  
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const category = params?.category as string;
  
    // カテゴリでフィルタリングした記事の取得
    const articles = getArticlesByCategory(category);
    const allCategories = getAllCategories();
    
    return {
      props: {
        category,
        articles,
        categories: allCategories,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error getting category data:', error);
    return { notFound: true };
  }
};

interface CategoryPageProps {
  category: string;
  articles: ArticleData[];
  categories: Record<string, number>;
}

export default function CategoryPage({ category, articles, categories }: CategoryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // カテゴリ名の最初の文字を大文字に
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <>
      <Head>
        <title>{displayCategory} - 記事一覧 | News24</title>
        <meta name="description" content={`${displayCategory}に関する記事一覧。${articles.length}件の記事があります。`} />
      </Head>
      
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10 -mt-8 mb-8 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-4">
              <FolderIcon className="h-8 w-8 mr-2" />
              <h1 className="text-3xl md:text-4xl font-bold">{displayCategory}</h1>
            </div>
            <p className="text-lg opacity-90">
              <span className="font-medium">{articles.length}</span> 件の記事
            </p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-4 animate-fade-in">
        {/* ナビゲーション */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            <span>トップに戻る</span>
          </Link>

          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="md:col-span-1">
            <CategoryNav categories={categories} />
          </div>
          
          {/* 記事リスト */}
          <div className="md:col-span-3">
            {articles.length > 0 ? (
              <ArticleList articles={articles} initialViewMode={viewMode} />
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
                <p className="mt-4 text-gray-500 dark:text-gray-400 mb-2">このカテゴリーには記事がありません</p>
                <Link 
                  href="/"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  トップページへ戻る
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
