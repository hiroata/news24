import React, { useState, useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from 'next/router';
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  ShareIcon,
  BookmarkIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import TagList from "../../components/TagList";
import { LanguageCode, DEFAULT_LANGUAGE } from '../../lib/utils/i18n';
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { getAllArticleSlugs, getArticleBySlug } from "../../lib/articles";
import type { ArticleData } from "../../types/article";
import SourceBadge from "../../components/SourceBadge";

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllArticleSlugs();
  const paths = slugs.map((slug) => ({ params: { slug } }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;
    const article = getArticleBySlug(slug);

    if (!article) {
      return { notFound: true };
    }

    return {
      props: {
        article,
        currentLanguage: article.language,
      },
      revalidate: 60,
    };
  } catch (error) {
    return { notFound: true };
  }
};

interface ArticleDetailProps {
  article: ArticleData;
  currentLanguage: LanguageCode;
}

export default function ArticleDetailPage({ article, currentLanguage }: ArticleDetailProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // ブックマーク状態を確認（ローカルストレージから）
  useEffect(() => {
    const checkIfBookmarked = () => {
      if (typeof window !== 'undefined') {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(article.slug));
      }
    };
    checkIfBookmarked();
  }, [article.slug]);

  // ブックマークの切り替え
  const toggleBookmark = () => {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      let newBookmarks = [];
      
      if (isBookmarked) {
        newBookmarks = bookmarks.filter((slug: string) => slug !== article.slug);
      } else {
        newBookmarks = [...bookmarks, article.slug];
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(!isBookmarked);
    }
  };

  // 共有機能
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      })
      .catch((error) => console.log('共有に失敗しました', error));
    } else {
      // Web Share API非対応の場合は、URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('URLをクリップボードにコピーしました'))
        .catch(() => alert('URLのコピーに失敗しました'));
    }
  };

  if (router.isFallback || !article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary-200 dark:bg-primary-900 mb-4"></div>
          <div className="text-primary-600 dark:text-primary-400">記事を読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - News24</title>
        <meta name="description" content={article.excerpt || article.content.slice(0, 150)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.content.slice(0, 150)} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:tag" content={article.tags.join(', ')} />
      </Head>
      
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        {/* 記事ナビゲーションバー */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            <span>トップに戻る</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked 
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label={isBookmarked ? "ブックマークから削除" : "ブックマークに追加"}
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={shareArticle}
              className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="この記事を共有"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            
            <LanguageSwitcher />
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* ヘッダーエリア */}
          <header className="mb-8">
            {/* カバー画像（あれば） */}
            {article.coverImage && (
              <div className="relative h-64 md:h-96 mb-6 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={article.coverImage}
                  alt={`${article.title}のカバー画像`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <SourceBadge source={article.originalSource} />
                </div>
              </div>
            )}
            
            {/* タグリスト */}
            <div className="mb-4">
              <TagList tags={article.tags} size="sm" />
            </div>
            
            {/* タイトル */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h1>
            
            {/* メタ情報 */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
              {article.date && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <time dateTime={article.date}>{new Date(article.date).toLocaleDateString()}</time>
                </div>
              )}
              
              {article.readingTime && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>読了時間: 約{article.readingTime}分</span>
                </div>
              )}
              
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                <span>文字数: {article.content.length}文字</span>
              </div>
              
              <div className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                <a 
                  href={article.originalUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {article.originalSource}の元記事
                </a>
              </div>
            </div>
          </header>
          
          {/* 記事本文 */}
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary-600 dark:prose-a:text-primary-400 mb-10">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>
          
          {/* タグフッター */}
          <div className="border-t border-b border-gray-200 dark:border-gray-800 py-6 my-8">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-3">関連タグ:</h3>
            <TagList tags={article.tags} size="md" />
          </div>
          
          {/* 原文リンク */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-medium mb-2">元の記事</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              この記事は {article.originalSource} の記事を翻訳・要約したものです。
              原文の全文は以下のリンクからお読みいただけます。
            </p>
            <a 
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline"
            >
              <span>原文を読む</span>
              <ArrowLeftIcon className="h-4 w-4 ml-1 rotate-180" />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
