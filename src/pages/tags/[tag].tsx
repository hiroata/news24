import React from "react";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { Tag } from "../../components/TagList";
import { getAllTags, getNovelsByTag, NovelData } from "../../lib/novels"; // NovelData をインポート
import { DEFAULT_LANGUAGE, LanguageCode } from "../../lib/i18n";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useState } from "react";
import TagList from "../../components/TagList";

export const getStaticPaths: GetStaticPaths = async () => {
  // 共通ライブラリ関数を使用
  const tags = getAllTags();
  const paths = Object.keys(tags).map((tag) => ({ params: { tag } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tag = params?.tag as string;
  
  // 共通ライブラリ関数を使用
  const novels = getNovelsByTag(tag);
  const allTags = getAllTags();
  
  // 関連タグを抽出 (同じ記事に含まれるタグを関連タグとして抽出)
  const relatedTagsMap: Record<string, number> = {};
  novels.forEach(novel => {
    novel.tags.forEach(t => {
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
      novels,
      relatedTags
    } 
  };
};

interface TagPageProps {
  tag: string;
  novels: NovelData[];
  relatedTags: string[];
}

export default function TagPage({ tag, novels, relatedTags }: TagPageProps) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          トップに戻る
        </Link>
        
        <LanguageSwitcher 
          onLanguageChange={setCurrentLang}
          className="ml-auto"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">タグ:</h1>
        <Tag tag={tag} size="lg" asLink={false} />
      </div>
      
      {relatedTags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">関連タグ:</h2>
          <TagList tags={relatedTags} />
        </div>
      )}
      
      <div className="border-b pb-2 mb-4">
        <span className="text-lg font-medium">{novels.length}件の小説</span>
      </div>
      
      <ul className="divide-y">
        {novels.map((novel) => (
          <li key={novel.slug} className="py-4">
            <Link href={`/novels/${novel.slug}`} className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded-md transition-colors">
              <h3 className="text-xl font-bold hover:text-pink-600 transition-colors">{novel.title}</h3>
            </Link>
            <div className="text-xs text-gray-500 mb-2">{novel.date}</div>
            <div className="mb-2">
              <TagList tags={novel.tags} size="sm" />
            </div>
            <p className="text-gray-700">{novel.excerpt}</p>
          </li>
        ))}
      </ul>
      
      {novels.length === 0 && (
        <p className="text-center py-10 text-gray-500">
          このタグの小説はまだありません。
        </p>
      )}
    </main>
  );
}