import React from "react";
import Link from "next/link";
import { ClockIcon, BookOpenIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import TagList from "./TagList";
import { ArticleData } from "../types/article";
import SourceBadge from "./SourceBadge";

interface ArticleCardProps {
  article: ArticleData;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => (
  <div className="card overflow-hidden group animate-fade-in border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
    {/* カバーイメージエリア - イメージがあれば表示 */}
    {article.coverImage && (
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.coverImage}
          alt={`${article.title}のカバー画像`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
          <SourceBadge source={article.originalSource} />
        </div>
      </div>
    )}
    
    {/* コンテンツエリア */}
    <div className="p-5">
      {/* タグリスト */}
      <div className="mb-3">
        <TagList tags={article.tags} size="sm" />
      </div>
      
      {/* タイトル */}
      <Link href={`/articles/${article.slug}`}>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {article.title}
        </h2>
      </Link>
      
      {/* 概要 */}
      <p className="mb-4 text-gray-600 dark:text-gray-400 line-clamp-3">
        {article.excerpt}
      </p>
      
      {/* メタ情報 */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4" />
          <span>{new Date(article.date).toLocaleDateString()}</span>
        </div>
        
        {article.readingTime && (
          <div className="flex items-center space-x-1">
            <BookOpenIcon className="w-4 h-4" />
            <span>{article.readingTime}分で読めます</span>
          </div>
        )}
      </div>
      
      {/* 出典情報 */}
      <div className="flex justify-between items-center text-sm mb-4">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <GlobeAltIcon className="w-4 h-4 mr-1" />
          <a 
            href={article.originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary-600 dark:hover:text-primary-400"
          >
            元記事を読む
          </a>
        </div>
      </div>
      
      {/* アクションエリア */}
      <div className="mt-4 flex justify-end">
        <Link href={`/articles/${article.slug}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          続きを読む
        </Link>
      </div>
    </div>
  </div>
);

export default ArticleCard;
