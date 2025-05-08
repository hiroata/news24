import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState('ja');
  
  useEffect(() => {
    // URL パスから現在の言語を取得
    const { pathname, query } = router;
    
    if (pathname.startsWith('/lang/')) {
      const langFromPath = pathname.split('/')[2];
      setCurrentLang(langFromPath);
    } else if (query.lang) {
      setCurrentLang(query.lang as string);
    } else {
      // ブラウザ言語に基づいてデフォルトを設定
      const browserLang = navigator.language.split('-')[0];
      if (languages.some(lang => lang.code === browserLang)) {
        setCurrentLang(browserLang);
      }
    }
  }, [router.pathname, router.query]);

  const changeLanguage = (langCode: string) => {
    const { pathname, asPath, query } = router;
    
    if (pathname.startsWith('/lang/')) {
      // 言語パスを新しい言語に置き換え
      router.push(
        `/lang/${langCode}${pathname.substring(pathname.indexOf('/', 6))}`,
        `/lang/${langCode}${asPath.substring(asPath.indexOf('/', 6))}`,
        { locale: langCode }
      );
    } else {
      // クエリパラメータとしての言語を更新
      const newQuery = { ...query, lang: langCode };
      router.push({ pathname, query: newQuery }, undefined, { locale: langCode });
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="group flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none">
        <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
        <span className="font-medium text-sm hidden sm:inline">
          {languages.find(lang => lang.code === currentLang)?.name || '日本語'}
        </span>
        <ChevronDownIcon
          className="h-4 w-4 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          aria-hidden="true"
        />
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    type="button"
                    className={`${
                      active
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    } ${
                      currentLang === language.code
                        ? 'font-medium text-primary-600 dark:text-primary-400'
                        : ''
                    } group flex w-full items-center px-4 py-2 text-sm`}
                    onClick={() => changeLanguage(language.code)}
                  >
                    {language.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}