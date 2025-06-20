// src/components/ProductCatalog.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Keep for redirect
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useComparison } from '@/context/ComparisonContext';
import { CheckIcon, HeartIcon as HeartSolid, ArrowsRightLeftIcon as ArrowsRightLeftSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ArrowsRightLeftIcon as ArrowsRightLeftOutline } from '@heroicons/react/24/outline';
import { Product as ProductTypeFromTypes } from '@/types';

interface ProductCatalogProps {
  limit?: number;
  category?: string; // << NEW: To filter by category
  showTitle?: boolean;
  showExploreButton?: boolean;
  gridCols?: string;
  sectionBg?: string;
  titleText?: string;
}

const ProductCatalog = ({ 
  limit, 
  category, // << NEW
  showTitle = true, 
  showExploreButton = true,
  gridCols = 'lg:grid-cols-3 xl:grid-cols-4',
  sectionBg = 'bg-gray-50',
  titleText = 'Featured Products' // Default title
}: ProductCatalogProps) => {
  const [allProducts, setAllProducts] = useState<ProductTypeFromTypes[]>([]);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { 
    comparisonItems, 
    toggleComparison, 
    isInComparison,
    MAX_COMPARISON_ITEMS 
  } = useComparison(); 

  const { data: session } = useSession();
  const router = useRouter();
  
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [justWishlistedId, setJustWishlistedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the actual title based on props and category
  const actualTitle = category 
    ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') // Capitalize category name
    : titleText;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      let apiUrl = '/api/products';
      if (category) {
        apiUrl += `?category=${encodeURIComponent(category)}`;
      }

      try {
        const response = await fetch(apiUrl); 
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Failed to fetch products (status: ${response.status})`);
        }
        const data: ProductTypeFromTypes[] = await response.json();
        setAllProducts(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category]); // << Re-fetch when category changes

  const handleAddToCart = (product: ProductTypeFromTypes) => {
    addToCart(product);
    setAddedToCartId(product.id);
    setTimeout(() => {
      setAddedToCartId(null);
    }, 2000);
  };

  const handleWishlistToggle = (productId: string) => {
    if (!session) {
        alert('Please log in to add items to your wishlist.');
        router.push('/login'); // Use Next.js router for navigation
        return;
    }
    const inWishlist = wishlist.includes(productId);
    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
      setJustWishlistedId(productId);
      setTimeout(() => {
        setJustWishlistedId(null);
      }, 2000);
    }
  };

  const handleCompareToggle = (product: ProductTypeFromTypes) => {
    toggleComparison(product);
  };

  const productsToDisplay = limit ? allProducts.slice(0, limit) : allProducts;

  const renderLoading = () => (
    <div className="text-center py-10"><p className="text-gray-500">Loading products...</p></div>
  );
  const renderError = () => (
    <div className="text-center py-10"><p className="text-red-500">Error loading products: {error}</p></div>
  );
  const renderNoProducts = () => (
     <div className="text-center py-10"><p className="text-gray-500">No products found {category ? `in ${actualTitle}` : 'at the moment'}.</p></div>
  );

  return (
    <section className={`py-16 sm:py-24 ${sectionBg}`}>
      <div className="container px-4 mx-auto">
        {showTitle && (
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-graphite tracking-tight">
              {actualTitle}
            </h2>
          </div>
        )}
        
        {isLoading && renderLoading()}
        {error && renderError()}
        {!isLoading && !error && productsToDisplay.length === 0 && renderNoProducts()}

        {!isLoading && !error && productsToDisplay.length > 0 && (
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 ${gridCols}`}>
            {productsToDisplay.map((product, index) => {
              const inWishlist = wishlist.includes(product.id);
              const wasJustWishlisted = justWishlistedId === product.id && !inWishlist; // This logic might need slight adjustment if 'inWishlist' updates async
              const isComparing = isInComparison(product.id);

              return (
                <div
                  key={product.id}
                  className={`group flex flex-col bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border ${
                      isComparing ? 'border-solar-flare-end ring-2 ring-solar-flare-start/50' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Link href={`/products/${product.id}`} passHref legacyBehavior>
                    <a className="block group"> 
                      <div 
                        className="relative w-full overflow-hidden bg-gray-100 h-56 sm:h-60 md:h-64 group-hover:opacity-90 transition-opacity duration-300" 
                      >
                        {product.imageUrl ? (
                            <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                fill // Use fill instead of layout="fill"
                                style={{ objectFit: 'cover' }} // Use style for objectFit with fill
                                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                                sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw" 
                                priority={index < (limit || 4)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No Image
                            </div>
                        )}
                      </div>
                    </a>
                  </Link>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <Link href={`/products/${product.id}`} passHref legacyBehavior>
                      <a className="block mb-2">
                        <h3 className="text-lg font-semibold text-graphite line-clamp-2 group-hover:text-solar-flare-start transition-colors duration-200" style={{ minHeight: '2.5em' }}>
                          {product.name}
                        </h3>
                        {product.wattage != null && <p className="mt-1 text-xs text-gray-500">{product.wattage}W Panel</p>}
                      </a>
                    </Link>
                    
                    <div className="mt-auto">
                      <div className="flex items-center space-x-3 mb-4 text-xs">
                        <button
                          onClick={() => handleWishlistToggle(product.id)}
                          className={`flex items-center space-x-1 p-1 rounded-md transition-colors ${
                            inWishlist ? 'text-red-500 bg-red-100/50 hover:bg-red-100' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                          }`}
                          disabled={isWishlistLoading}
                          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          {inWishlist ? <HeartSolid className="h-4 w-4" /> : <HeartOutline className="h-4 w-4" />}
                          <span className="hidden sm:inline text-xs">{inWishlist ? 'Wishlisted' : (justWishlistedId === product.id ? 'Added!' : 'Wishlist')}</span>
                        </button>
                        <button 
                          onClick={() => handleCompareToggle(product)}
                          className={`flex items-center space-x-1 p-1 rounded-md transition-colors ${
                              isComparing ? 'text-solar-flare-end bg-orange-100/50 hover:bg-orange-100 font-semibold' : 'text-gray-500 hover:text-solar-flare-start hover:bg-orange-50'
                          }`}
                          disabled={comparisonItems.length >= MAX_COMPARISON_ITEMS && !isComparing} 
                          title={isComparing ? "Remove from Compare" : (comparisonItems.length >= MAX_COMPARISON_ITEMS ? `Max ${MAX_COMPARISON_ITEMS} items to compare` : "Add to Compare")}
                        >
                          {isComparing ? <ArrowsRightLeftSolid className="h-4 w-4" /> : <ArrowsRightLeftOutline className="h-4 w-4" />}
                          <span className="hidden sm:inline text-xs">{isComparing ? 'Comparing' : 'Compare'}</span>
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-gray-100 space-y-3 sm:space-y-0">
                        <span className="text-2xl font-bold text-deep-night">Ksh {product.price.toLocaleString()}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white rounded-full shadow-md transition-all duration-300 whitespace-nowrap ${
                            addedToCartId === product.id 
                              ? 'bg-green-500 hover:bg-green-600 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:from-solar-flare-end hover:to-solar-flare-start hover:shadow-lg transform hover:scale-105'
                          }`}
                          disabled={addedToCartId === product.id}
                        >
                          {addedToCartId === product.id ? ( <span className="flex items-center justify-center"><CheckIcon className="h-5 w-5 mr-2" />Added!</span> ) : ( 'Add to Cart' )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showExploreButton && allProducts.length > (limit || 0) && (
          <div className="mt-16 text-center">
            <Link href="/products" legacyBehavior>
              <a className="inline-block px-10 py-3 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-solar-flare-end focus:ring-opacity-50 active:scale-95">
                Explore All Products
              </a>
            </Link>
          </div>
        )}
         {showExploreButton && category && (limit ? allProducts.length >= limit : true) && (
             <div className="mt-16 text-center">
                <Link href="/products" legacyBehavior>
                <a className="inline-block px-10 py-3 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 active:scale-95">
                    View All Categories
                </a>
                </Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;