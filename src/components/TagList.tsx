import React from 'react';
import Link from 'next/link';
import { HashtagIcon } from '@heroicons/react/24/outline';

interface TagProps {
  tag: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  asLink?: boolean;
}

// 単一のタグコンポーネント
export function Tag({ tag, size = 'md', className = '', asLink = true }: TagProps) {
  const baseClasses = "inline-flex items-center justify-center space-x-1 rounded-full transition-all duration-200";
  
  // サイズに基づくクラス
  const sizeClasses = {
    xs: "text-xs px-2 py-0.5",
    sm: "text-xs px-2.5 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };
  
  // スタイルとサイズに基づくアイコンサイズ
  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  };
  
  const tagContent = (
    <>
      <HashtagIcon className={`${iconSizes[size]} opacity-70`} />
      <span>{tag}</span>
    </>
  );

  const tagClasses = `${baseClasses} ${sizeClasses[size]} ${
    asLink 
      ? 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-900/30 dark:hover:text-primary-400' 
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  } ${className}`;

  if (asLink) {
    return (
      <Link href={`/tags/${tag}`} className={`${tagClasses} group`}>
        {tagContent}
      </Link>
    );
  }

  return (
    <span className={tagClasses}>
      {tagContent}
    </span>
  );
}

interface TagListProps {
  tags: string[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  asLinks?: boolean;
}

// 複数のタグを表示するコンポーネント
export default function TagList({ tags, size = 'md', className = '', asLinks = true }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map(tag => (
        <div key={tag} className="animate-fade-in">
          <Tag tag={tag} size={size} asLink={asLinks} />
        </div>
      ))}
    </div>
  );
}
