import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from 'next/router';
import ReactMarkdown from "react-markdown";
import TagList from "../../components/TagList";
import { LanguageCode, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, isValidLang } from '../../lib/utils/i18n';
import LanguageSwitcher from "../../components/LanguageSwitcher";
import Link from "next/link";
import { AudioPlayer } from "../../components/AudioPlayer";
import { useState, useEffect } from "react";
import { getNovelBySlug, getAllNovelSlugs } from "../../lib/novels";
import type { NovelData } from "../../types/novel";
import Head from "next/head";
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  ShareIcon,
  BookmarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 静的パス生成は変更なし
export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllNovelSlugs();
  const paths: { params: { slug: string[] }; locale?: string }[] = [];
  slugs.forEach(slug => {
    paths.push({ params: { slug: [slug] } });
    // 多言語ファイルの存在確認はlib/novels.ts側で行い、ここでは全言語分のパスを生成
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
      if (lang !== DEFAULT_LANGUAGE) {
        // その言語の小説データが存在する場合のみパスを追加
        const novel = getNovelBySlug(slug, lang as LanguageCode);
        if (novel) {
          paths.push({ params: { slug: [lang, slug] } });
        }
      }
    });
  });

  return { paths, fallback: 'blocking' };
};

// 静的プロップ生成も変更なし
export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const slugParams = params?.slug as string[] | undefined;

    if (!slugParams || slugParams.length === 0) {
      return { notFound: true };
    }

    let lang: LanguageCode = DEFAULT_LANGUAGE;
    let novelSlug: string;

    if (slugParams.length === 1) {
      novelSlug = slugParams[0];
    } else if (slugParams.length === 2 && isValidLang(slugParams[0])) {
      lang = slugParams[0] as LanguageCode;
      novelSlug = slugParams[1];
    } else {
      return { notFound: true };
    }

    const novel = getNovelBySlug(novelSlug, lang);

    if (!novel) {
      if (lang !== DEFAULT_LANGUAGE) {
        const defaultLangNovel = getNovelBySlug(novelSlug, DEFAULT_LANGUAGE);
        if (defaultLangNovel) {
          return { notFound: true };
        }
      }
      return { notFound: true };
    }

    const availableLanguages: LanguageCode[] = [DEFAULT_LANGUAGE];
    const baseSlug = novel.slug;
    Object.keys(SUPPORTED_LANGUAGES).forEach(lCode => {
      if (lCode !== DEFAULT_LANGUAGE) {
        const langNovel = getNovelBySlug(baseSlug, lCode as LanguageCode);
        if (langNovel) {
          availableLanguages.push(lCode as LanguageCode);
        }
      }
    });
    
    const novelWithAvailableLanguages = { 
      ...novel, 
      availableLanguages,
      readingTime: calculateReadingTime(novel.content)
    };

    return {
      props: {
        novel: novelWithAvailableLanguages,
        currentLanguage: lang,
      },
      revalidate: 60,
    };
  } catch (error) {
    // 例外発生時は404
    return { notFound: true };
  }
};

// 文章の読了時間を計算する関数
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

interface NovelDetailProps {
  novel: NovelData & { 
    availableLanguages: LanguageCode[],
    readingTime?: number
  };
  currentLanguage: LanguageCode;
}

export default function NovelDetailPage({ novel, currentLanguage }: NovelDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // router.query.slug が配列であることを期待
  const slugPathParts = router.query.slug as string[] || [];
  const actualSlug = slugPathParts.length > 1 ? slugPathParts[slugPathParts.length -1] : slugPathParts[0];

  // 関連記事（本来はAPIから取得）
  const relatedArticles = [
    { id: 1, title: "関連記事1", slug: "related-1" },
    { id: 2, title: "関連記事2", slug: "related-2" },
    { id: 3, title: "関連記事3", slug: "related-3" },
  ];

  const handleLanguageChange = (selectedLang: LanguageCode) => {
    setIsLoading(true);
    if (selectedLang === DEFAULT_LANGUAGE) {
      router.push(`/novels/${actualSlug}`);
    } else {
      router.push(`/novels/${selectedLang}/${actualSlug}`);
    }
  };
  
  // isLoading状態を解除するためにuseEffectを使用
  useEffect(() => {
    const handleRouteChangeComplete = () => setIsLoading(false);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    
    // ブックマーク状態を確認（ローカルストレージから）
    const checkIfBookmarked = () => {
      if (typeof window !== 'undefined') {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(novel.slug));
      }
    };
    checkIfBookmarked();
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events, novel.slug]);

  // ブックマークの切り替え
  const toggleBookmark = () => {
    if (typeof window !== 'undefined') {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      let newBookmarks = [];
      
      if (isBookmarked) {
        newBookmarks = bookmarks.filter((slug: string) => slug !== novel.slug);
      } else {
        newBookmarks = [...bookmarks, novel.slug];
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(!isBookmarked);
    }
  };

  // 共有機能
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: novel.title,
        text: novel.excerpt,
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

  if (router.isFallback || !novel) {
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
        <title>{novel.title} - News24</title>
        <meta name="description" content={novel.excerpt || novel.content.slice(0, 150)} />
        <meta property="og:title" content={novel.title} />
        <meta property="og:description" content={novel.excerpt || novel.content.slice(0, 150)} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={novel.date} />
        <meta property="article:tag" content={novel.tags.join(', ')} />
      </Head>
      
      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary-200 dark:bg-primary-900 mb-4"></div>
            <div className="text-primary-600 dark:text-primary-400">読み込み中...</div>
          </div>
        </div>
      )}
      
      <main className="container-custom py-8 animate-fade-in">
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
            {novel.coverImage && (
              <div className="relative h-64 md:h-96 mb-6 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={novel.coverImage}
                  alt={`${novel.title}のカバー画像`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* タグリスト */}
            <div className="mb-4">
              <TagList tags={novel.tags} size="sm" />
            </div>
            
            {/* タイトル */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
              {novel.title}
            </h1>
            
            {/* メタ情報 */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
              {novel.date && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <time dateTime={novel.date}>{novel.date}</time>
                </div>
              )}
              
              {novel.readingTime && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>読了時間: 約{novel.readingTime}分</span>
                </div>
              )}
              
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                <span>文字数: {novel.content.length}文字</span>
              </div>
            </div>
          </header>
          
          {/* 音声プレーヤー */}
          {novel.audioUrl && (
            <div className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              <AudioPlayer src={novel.audioUrl} />
            </div>
          )}
          
          {/* 記事本文 */}
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary-600 dark:prose-a:text-primary-400 mb-10">
            <ReactMarkdown>{novel.content}</ReactMarkdown>
          </article>
          
          {/* タグフッター */}
          <div className="border-t border-b border-gray-200 dark:border-gray-800 py-6 my-8">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-3">関連タグ:</h3>
            <TagList tags={novel.tags} size="md" />
          </div>
          
          {/* 言語切り替えセクション */}
          {novel.availableLanguages && novel.availableLanguages.length > 1 && (
            <div className="my-8">
              <h3 className="text-xl font-medium mb-3 text-gray-900 dark:text-white">他の言語で読む</h3>
              <div className="flex flex-wrap gap-2">
                {novel.availableLanguages.map((langCode) => (
                  <button
                    key={langCode}
                    onClick={() => handleLanguageChange(langCode)}
                    disabled={langCode === currentLanguage || isLoading}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors
                      ${langCode === currentLanguage 
                        ? 'bg-primary-100 border border-primary-200 text-primary-800 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-400 cursor-default' 
                        : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <span>{SUPPORTED_LANGUAGES[langCode]?.flag || ''}</span>
                    <span>{SUPPORTED_LANGUAGES[langCode]?.name || langCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}