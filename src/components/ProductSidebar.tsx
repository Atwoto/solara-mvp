// src/components/ProductSidebar.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { productCategoriesData } from '@/lib/navigationData';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

const ProductSidebar = () => {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-28 bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold text-deep-night mb-4 border-b pb-3">Product Categories</h3>
        <nav className="space-y-2">
          {productCategoriesData.map((category) => {
            const categorySlug = category.href.split('=').pop() || null;
            const isActive = currentCategory === categorySlug || (!currentCategory && category.name === 'All Products');

            return (
              <div key={category.name}>
                <Link
                  href={category.href}
                  className={`flex justify-between items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-solar-flare-start/10 text-solar-flare-end' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                  {category.subcategories && <ChevronRightIcon className="h-4 w-4" />}
                </Link>
                {category.subcategories && (
                  <div className="pl-4 mt-1 space-y-1 border-l-2 ml-3 border-gray-200">
                    {category.subcategories.map(sub => {
                       const subCategorySlug = sub.href.split('=').pop();
                       const isSubActive = currentCategory === subCategorySlug;
                       return (
                         <Link key={sub.name} href={sub.href} className={`block px-3 py-2 text-xs rounded-md ${isSubActive ? 'font-semibold text-solar-flare-end bg-solar-flare-start/5' : 'text-gray-500 hover:text-deep-night'}`}>
                           {sub.name}
                         </Link>
                       )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default ProductSidebar;