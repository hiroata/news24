import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface CategoryNavProps {
  categories: {
    [key: string]: number;
  };
}

const CATEGORY_ICONS = {
  'ai': '🤖',
  'software': '💻',
  'hardware': '🔌',
  'mobile': '📱',
  'gaming': '🎮',
  'security': '🔒',
  'blockchain': '⛓️',
  'business': '💼',
  'technology': '⚙️',
};

const CategoryNav: React.FC<CategoryNavProps> = ({ categories }) => {
  const router = useRouter();
  const currentCategory = router.query.category as string;
  
  return (
    <nav className="mb-6">
      <h3 className="font-medium text-gray-900 dark:text-white mb-3">カテゴリー</h3>
      <div className="space-y-1">
        <Link 
          href="/" 
          className={`block px-3 py-2 rounded-md text-sm ${
            !currentCategory ? 
            'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' : 
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          すべて
        </Link>
        
        {Object.entries(categories).map(([category, count]) => (
          <Link
            key={category}
            href={`/categories/${category}`}
            className={`flex justify-between items-center px-3 py-2 rounded-md text-sm ${
              currentCategory === category ? 
              'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400' : 
              'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center">
              <span className="mr-2">{CATEGORY_ICONS[category] || '📄'}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 text-xs rounded-full">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;
