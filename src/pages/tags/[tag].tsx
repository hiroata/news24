import React from "react";
import Link from "next/link";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { Tag } from "../../components/TagList";
import { getAllTags, getArticlesByTag } from "../../lib/articles";
import type { ArticleData } from "../../types/article";
import { DEFAULT_LANGUAGE, LanguageCode } from "../../lib/utils/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useState } from "react";
import TagList from "../../components/TagList";
import ArticleList from "../../components/ArticleList";
import { 
  ArrowLeftIcon, 
  HashtagIcon, 
  FunnelIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export const getStaticPaths: GetStaticPaths = async () => {
  // 共通ライブラリ関数を使用
  const tags = getAllTags();
  const paths = Object.keys(tags).map((tag) => ({ params: { tag } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const tag = params?.tag as string;
  
    // 共通ライブラリ関数を使用
    const articles = getArticlesByTag(tag);
    const allTags = getAllTags();
  
    // 関連タグを抽出 (同じ記事に含まれるタグを関連タグとして抽出)
    const relatedTagsMap: Record<string, number> = {};
    articles.forEach(article => {
      article.tags.forEach(t => {
        if (t !== tag) {
          relatedTagsMap[t] = (relatedTagsMap[t] || 0) + 1;
        }
      });
    });
  
    // 出現回数順に並べ替え
    const relatedTags = Object.entries(relatedTagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)  // 上位5件のみ
      .map(([tag]) => tag);
  
    return { 
      props: { 
        tag, 
        articles,
        relatedTags,
        tagCount: allTags[tag] || 0
      } 
    };
  } catch (error) {
    // 例外発生時は404
    return { notFound: true };
  }
};

interface TagPageProps {
  tag: string;
  articles: ArticleData[];
  relatedTags: string[];
  tagCount: number;
}

export default function TagPage({ tag, articles, relatedTags, tagCount }: TagPageProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  return (
    <>      <Head>
        <title>#{tag} の記事一覧 - News24</title>
        <meta name="description" content={`${tag}に関する記事一覧。${articles.length}件の記事があります。`} />
      </Head>
      
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-10 -mt-8 mb-8 animate-fade-in">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-4">
              <HashtagIcon className="h-8 w-8 mr-2" />
              <h1 className="text-3xl md:text-4xl font-bold">{tag}</h1>
            </div>            <p className="text-lg opacity-90">
              <span className="font-medium">{articles.length}</span> 件の記事 / <span className="font-medium">{tagCount}</span> 回使用されたタグ
            </p>
          </div>
        </div>
      </div>
      
      <main className="container-custom py-4 animate-fade-in">
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
            {relatedTags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <h2 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <FunnelIcon className="h-5 w-5 mr-2 text-primary-500" />
                  関連タグ
                </h2>
                <TagList tags={relatedTags} size="sm" className="flex flex-wrap gap-2" />
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-primary-500" />
                記事情報
              </h3>
            </div>
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
                <p className="mt-4 text-gray-500 dark:text-gray-400 mb-2">このタグの記事はまだありません</p>
                <Link href="/"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  トップページに戻る
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}