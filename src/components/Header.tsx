import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';

const navigation = [
  { name: 'ホーム', href: '/' },
  { name: 'ノベル', href: '/novels' },
  { name: 'タグ一覧', href: '/tags' },
  { name: '新着情報', href: '/news' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  
  // スクロールに応じてヘッダーの外観を変更
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => {
    return router.pathname === path || 
      (path !== '/' && router.pathname.startsWith(path));
  };

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow' 
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg w-8 h-8 flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent text-2xl font-bold">
              News24
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative text-base font-medium transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400 px-1 py-2 group ${
                  isActive(item.href)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.name}
                {/* アクティブインジケーター */}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform origin-left transition-transform duration-300 ${
                  isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* 検索ボタン */}
            <button className="hidden sm:flex items-center justify-center p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* 通知ボタン */}
            <button className="hidden sm:flex items-center justify-center p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="メニューを開く"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="container-custom py-3">
            <nav className="flex flex-col space-y-1 pb-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-base font-medium px-3 py-3 rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                    )}
                  </div>
                </Link>
              ))}

              {/* モバイル専用の検索バー */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="記事を検索する..."
                    className="block w-full bg-gray-100 dark:bg-gray-800 border-0 py-2 pl-10 pr-3 text-gray-700 dark:text-gray-300 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </Transition>
    </header>
  );
}