// src/app/products/page.tsx
'use client'; 

import ProductCatalog from '@/components/ProductCatalog';
import PageHeader from '@/components/PageHeader'; 
import Head from 'next/head'; 
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; 
import { PRODUCT_CATEGORY_SLUGS, ProductCategorySlug } from '@/types';

const capitalizeCategoryName = (slug?: string | null): string => {
  if (!slug) return 'All Products';
  // Attempt to find a more descriptive name if it's a known slug from types.ts,
  // otherwise, just format the slug.
  // You might want to create a mapping from slugs to display names if they differ significantly.
  if (PRODUCT_CATEGORY_SLUGS.includes(slug as ProductCategorySlug)) {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '); // Basic formatting for other slugs
};

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categorySlugFromUrl = searchParams.get('category') || undefined; // This will now be e.g., "grid-tied-inverters"
  
  const pageTitle = capitalizeCategoryName(categorySlugFromUrl); 
  const metaDescription = categorySlugFromUrl 
    ? `Explore our ${pageTitle} at Bills On Solar EA Limited.`
    : 'Explore our full range of high-efficiency solar panels, inverters, batteries, and complete solar solutions.';

  return (
    <>
      <Head>
        <title>{`${pageTitle} - Bills On Solar EA Limited`}</title>
        <meta name="description" content={metaDescription} />
      </Head>

      <PageHeader
        title={pageTitle}
        subtitle={categorySlugFromUrl ? `Browse our selection of ${pageTitle.toLowerCase()}.` : "Our complete range of high-efficiency solar solutions."}
      />

      <div className="container mx-auto px-4 pb-12 sm:pb-20">
        <ProductCatalog
          category={categorySlugFromUrl} // Pass the direct slug
          showTitle={false} 
          showExploreButton={!categorySlugFromUrl} 
          gridCols="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState />}> 
      <ProductsPageContent />
    </Suspense>
  );
}

const LoadingState = () => (
  <div className="container mx-auto px-4 py-10 text-center">
    <PageHeader title="Loading Products..." subtitle="Please wait while we fetch the best solar solutions for you." />
    <div className="animate-pulse mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-96 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
);