// src/app/products/page.tsx
'use client'; 

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

import PageHeader from '@/components/PageHeader';
import ProductSidebar from '@/components/ProductSidebar';
import ProductCatalog from '@/components/ProductCatalog';
import { productCategoriesData } from '@/lib/navigationData';

// --- Helper Functions ---
const getCategoryNameFromSlug = (slug?: string | null): string => {
  if (!slug) return 'All Products';
  for (const category of productCategoriesData) {
    if (category.href.endsWith(slug)) return category.name;
    if (category.subcategories) {
      for (const sub of category.subcategories) {
        if (sub.href.endsWith(slug)) return sub.name;
      }
    }
  }
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

type SortOrder = 'newest' | 'price-asc' | 'price-desc';

// --- Main Content Component ---
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Fetch all products once on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Could not load products.');
        setAllProducts(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Memoize the filtering and sorting logic to run only when dependencies change
  const displayedProducts = useMemo(() => {
    let filtered = categorySlug 
      ? allProducts.filter(p => p.category_slug === categorySlug)
      : allProducts;
    
    switch (sortOrder) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [allProducts, categorySlug, sortOrder]);

  const pageTitle = getCategoryNameFromSlug(categorySlug);

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={`Browse our complete selection of ${pageTitle.toLowerCase()}.`}
        backgroundImageUrl="/images/projects-hero-bg.jpg" // Re-using this for a nice techy feel
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }]}
      />

      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* --- Sidebar --- */}
            <ProductSidebar />
            
            {/* --- Main Content: Grid & Sorter --- */}
            <div className="w-full">
              {/* Sorter and Count */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b">
                <p className="text-gray-600 text-sm mb-4 sm:mb-0">
                  Showing <span className="font-bold text-deep-night">{displayedProducts.length}</span> products
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    id="sort"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-solar-flare-end focus:ring-solar-flare-end"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* "Wow" Animated Product Catalog */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={categorySlug + sortOrder} // This is the magic key for re-animating on change
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLoading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                  ) : error ? (
                    <div className="text-center py-20 text-red-500">{error}</div>
                  ) : (
                    <ProductCatalog products={displayedProducts} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main page export with Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<PageHeader title="Loading..." subtitle="Finding the best solar solutions for you." />}> 
      <ProductsPageContent />
    </Suspense>
  );
}