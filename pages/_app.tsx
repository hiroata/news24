import { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  // ダークモード設定をクライアントサイドでロード
  useEffect(() => {
    // システム設定からの初期値
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && isDarkMode)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <>      <Head>
        <title>News24 - 海外テクノロジーニュース</title>
        <meta name="description" content="海外のAI・テクノロジー最新ニュースを日本語でお届けするNews24" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Google Fontsの読み込み */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        <main className="flex-grow container-custom py-8">
          <Component {...pageProps} />
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">News24</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  © {new Date().getFullYear()} News24 All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                  利用規約
                </a>
                <a href="#" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                  プライバシーポリシー
                </a>
                <a href="#" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                  お問い合わせ
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}