import React from 'react';
import Link from 'next/link';

interface TagProps {
  tag: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  asLink?: boolean;
}

// 単一のタグコンポーネント
export function Tag({ tag, size = 'md', className = '', asLink = true }: TagProps) {
  const baseClasses = "inline-block rounded px-2 py-1 text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors";
  
  // サイズに基づくクラス
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  };
  
  const tagContent = (
    <span className="flex items-center space-x-1">
      <span>#</span>
      <span>{tag}</span>
    </span>
  );

  if (asLink) {
    return (
      <Link href={`/tags/${tag}`}>
        <span className={`${baseClasses} ${sizeClasses[size]} ${className} cursor-pointer`}>
          {tagContent}
        </span>
      </Link>
    );
  }

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      {tagContent}
    </span>
  );
}

interface TagListProps {
  tags: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  asLinks?: boolean;
}

// 複数のタグを表示するコンポーネント
export default function TagList({ tags, size = 'md', className = '', asLinks = true }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map(tag => (
        <Tag key={tag} tag={tag} size={size} asLink={asLinks} />
      ))}
    </div>
  );
}
