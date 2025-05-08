import React, { useState } from "react";
import NovelCard from "./NovelCard";
import type { NovelData } from "../types/novel";
import { ListBulletIcon, Squares2X2Icon as ViewGridIcon } from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'list';

type NovelListProps = {
  novels: NovelData[];
  initialViewMode?: ViewMode;
};

const NovelList: React.FC<NovelListProps> = ({ 
  novels, 
  initialViewMode = 'grid' 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  // 表示モード切り替え
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  if (!novels || novels.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">表示する記事がありません。</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 表示切り替えコントロール */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={toggleViewMode}
          className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={viewMode === 'grid' ? 'リスト表示に切り替え' : 'グリッド表示に切り替え'}
        >
          {viewMode === 'grid' ? (
            <>
              <ListBulletIcon className="h-5 w-5" />
              <span>リスト表示</span>
            </>
          ) : (
            <>
              <ViewGridIcon className="h-5 w-5" />
              <span>グリッド表示</span>
            </>
          )}
        </button>
      </div>

      {/* グリッドビュー */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map((novel) => (
            <div key={novel.slug} className="animate-slide-up">
              <NovelCard novel={novel} />
            </div>
          ))}
        </div>
      ) : (
        /* リストビュー */
        <div className="space-y-6">
          {novels.map((novel) => (
            <div key={novel.slug} className="animate-slide-up">
              <NovelCard novel={novel} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NovelList;
