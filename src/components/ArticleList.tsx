import React, { useState } from 'react';
import ArticleCard from './ArticleCard';
import { ArticleData } from '../types/article';
import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

interface ArticleListProps {
  articles: ArticleData[];
  initialViewMode?: 'grid' | 'list';
}

const ArticleList: React.FC<ArticleListProps> = ({ 
  articles,
  initialViewMode = 'grid'
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);

  if (!articles || articles.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">記事が見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      {/* 表示切り替えとソートコントロール */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          全 <span className="font-medium">{articles.length}</span> 件の記事
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md ${
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label="グリッド表示"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label="リスト表示"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 記事一覧 */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-6'
        }
      `}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
};

export default ArticleList;
