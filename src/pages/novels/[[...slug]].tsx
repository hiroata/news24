import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from 'next/router';
import ReactMarkdown from "react-markdown";
import TagList from "../../components/TagList";
import { LanguageCode, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, isValidLang } from '../../lib/utils/i18n';
import LanguageSwitcher from "../../components/LanguageSwitcher";
import Link from "next/link";
import { AudioPlayer } from "../../components/AudioPlayer";
import { useState, useEffect } from "react";
import { getNovelBySlug, NovelData, getAllNovelSlugs } from "../../lib/novels";
import Head from "next/head";

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllNovelSlugs(); // ベースとなるスラッグを取得 (例: novel-001)
  const paths: { params: { slug: string[] }; locale?: string }[] = [];

  slugs.forEach(slug => {
    // デフォルト言語のパス
    paths.push({ params: { slug: [slug] } });

    // サポートされている他の言語のパス
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
      if (lang !== DEFAULT_LANGUAGE) {
        const langFilePath = path.join(process.cwd(), "src/content/novels", `${slug}.${lang}.md`);
        if (fs.existsSync(langFilePath)) {
          paths.push({ params: { slug: [lang, slug] } });
        }
      }
    });
  });

  return { paths, fallback: 'blocking' }; // fallback: 'blocking' で ISR も可能に
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
    // フォールバック: 要求された言語で見つからない場合、デフォルト言語で試す
    if (lang !== DEFAULT_LANGUAGE) {
      const defaultLangNovel = getNovelBySlug(novelSlug, DEFAULT_LANGUAGE);
      if (defaultLangNovel) {
        // デフォルト言語版にリダイレクトするための情報を渡すことも検討できる
        // ここではとりあえず notFound とする
        return { notFound: true };
      }
    }
    return { notFound: true };
  }

  // 利用可能な翻訳言語を確認 (getNovelBySlug 内で処理されても良いが、ここで明示的に行う)
  const availableLanguages: LanguageCode[] = [DEFAULT_LANGUAGE];
  const baseSlug = novel.slug; // getNovelBySlug が返す slug は言語情報を含まないはず
  Object.keys(SUPPORTED_LANGUAGES).forEach(lCode => {
    if (lCode !== DEFAULT_LANGUAGE) {
      const langFilePath = path.join(process.cwd(), "src/content/novels", `${baseSlug}.${lCode}.md`);
      if (fs.existsSync(langFilePath)) {
        availableLanguages.push(lCode as LanguageCode);
      }
    }
  });
  
  // novelオブジェクトに availableLanguages を追加
  const novelWithAvailableLanguages = { ...novel, availableLanguages };

  return {
    props: {
      novel: novelWithAvailableLanguages,
      currentLanguage: lang, // 現在表示している言語を渡す
    },
    revalidate: 60, // 60秒ごとにISRで再生成
  };
};

interface NovelDetailProps {
  novel: NovelData & { availableLanguages: LanguageCode[] };
  currentLanguage: LanguageCode;
}

export default function NovelDetailPage({ novel, currentLanguage }: NovelDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // router.query.slug が配列であることを期待
  const slugPathParts = router.query.slug as string[] || [];
  const actualSlug = slugPathParts.length > 1 ? slugPathParts[slugPathParts.length -1] : slugPathParts[0];


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
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);


  if (router.isFallback || !novel) {
    return <div>Loading novel content...</div>;
  }

  return (
    <>
      <Head>
        <title>{novel.title} - EroNews Generator</title>
        <meta name="description" content={novel.excerpt || novel.content.slice(0, 150)} />
        <meta property="og:title" content={novel.title} />
        <meta property="og:description" content={novel.excerpt || novel.content.slice(0, 150)} />
        {/* 他のOGPタグも追加可能 */}
      </Head>
      <main className="max-w-2xl mx-auto py-8 px-4">
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-lg">読み込み中...</div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            トップに戻る
          </Link>
          
          <LanguageSwitcher 
            onLanguageChange={handleLanguageChange}
            currentLang={currentLanguage} // 現在の言語を渡す
            availableLangs={novel.availableLanguages} // 利用可能な言語を渡す
            className="ml-auto"
          />
        </div>

        <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>
        <div className="text-sm text-gray-500 mb-4">{novel.date}</div>
        
        <div className="mb-6">
          <TagList tags={novel.tags} />
        </div>
        
        {novel.audioUrl && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">音声版</h3>
            <AudioPlayer src={novel.audioUrl} />
          </div>
        )}
        
        <article className="prose prose-pink max-w-none">
          <ReactMarkdown>{novel.content}</ReactMarkdown>
        </article>
        
        {novel.availableLanguages && novel.availableLanguages.length > 1 && (
          <div className="mt-8 pt-4 border-t">
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">他の言語で読む:</h3>
            <div className="flex flex-wrap gap-2">
              {novel.availableLanguages.map((langCode) => (
                <button
                  key={langCode}
                  onClick={() => handleLanguageChange(langCode)}
                  disabled={langCode === currentLanguage || isLoading}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors
                    ${langCode === currentLanguage 
                      ? 'bg-pink-500 text-white cursor-default' 
                      : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                >
                  <span>{SUPPORTED_LANGUAGES[langCode]?.flag || ''}</span>
                  <span>{SUPPORTED_LANGUAGES[langCode]?.name || langCode}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
