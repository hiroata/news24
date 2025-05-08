import React from "react";
import Link from "next/link";
import { AudioPlayer } from "./AudioPlayer";
import TagList from "./TagList";
import { ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import type { NovelData } from "../types/novel";

interface NovelCardProps {
  novel: NovelData;
}

export const NovelCard: React.FC<NovelCardProps> = ({ novel }) => (
  <div className="card overflow-hidden group animate-fade-in">
    {/* カバーイメージエリア - イメージがあれば表示 */}
    {novel.coverImage && (
      <div className="relative h-48 overflow-hidden">
        <img
          src={novel.coverImage}
          alt={`${novel.title}のカバー画像`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    )}
    
    {/* コンテンツエリア */}
    <div className="p-5">
      {/* タグリスト */}
      <div className="mb-3">
        <TagList tags={novel.tags} size="sm" />
      </div>
      
      {/* タイトル */}
      <Link href={`/novels/${novel.slug}`}>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {novel.title}
        </h2>
      </Link>
      
      {/* 概要 */}
      <p className="mb-4 text-gray-600 dark:text-gray-400 line-clamp-3">
        {novel.excerpt}
      </p>
      
      {/* 音声プレーヤー（あれば） */}
      {novel.audioUrl && (
        <div className="mb-4">
          <AudioPlayer src={novel.audioUrl} />
        </div>
      )}
      
      {/* メタ情報 */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        {novel.date && (
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{new Date(novel.date).toLocaleDateString()}</span>
          </div>
        )}
        
        {novel.readingTime && (
          <div className="flex items-center space-x-1">
            <BookOpenIcon className="w-4 h-4" />
            <span>{novel.readingTime}分で読めます</span>
          </div>
        )}
      </div>
      
      {/* アクションエリア */}
      <div className="mt-4 flex justify-end">
        <Link href={`/novels/${novel.slug}`} className="btn btn-primary">
          続きを読む
        </Link>
      </div>
    </div>
  </div>
);

export default NovelCard;