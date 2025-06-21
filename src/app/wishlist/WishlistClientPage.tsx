// src/app/wishlist/WishlistClientPage.tsx
'use client'; 

import { useEffect, useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';
import Link from 'next/link';
import NextImage from 'next/image';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

const WishlistClientPage = () => {
  // Get what we need from contexts
  const { wishlist, isLoading: isWishlistContextLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  // State for this page specifically
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a log to see what the component gets from context on each render
  console.log("WISHLIST_CLIENT_PAGE: Render cycle triggered. Context state:", {
      isWishlistContextLoading,
      wishlist_id_count: wishlist.length,
      wishlist_ids: wishlist,
  });

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (isWishlistContextLoading) {
        console.log("WISHLIST_CLIENT_PAGE: Context is loading, waiting...");
        setIsLoadingProducts(true);
        return;
      }

      if (wishlist.length === 0) {
        console.log("WISHLIST_CLIENT_PAGE: Wishlist ID array from context is empty, clearing local products.");
        setWishlistProducts([]);
        setIsLoadingProducts(false);
        return;
      }
      
      setIsLoadingProducts(true);
      setError(null);
      console.log("WISHLIST_CLIENT_PAGE: Fetching product details for IDs:", wishlist);

      try {
        const productDetailsPromises = wishlist.map(productId =>
          fetch(`/api/product-details?id=${productId}`).then(res => {
            if (!res.ok) {
              console.error(`Failed to fetch details for product ID: ${productId}`);
              return null;
            }
            return res.json();
          })
        );
        
        const resolvedProducts = await Promise.all(productDetailsPromises);
        const validProducts = resolvedProducts.filter(p => p !== null) as Product[];
        
        console.log("WISHLIST_CLIENT_PAGE: Setting fetched products, count:", validProducts.length);
        setWishlistProducts(validProducts);

      } catch (err: any) { 
        console.error("WISHLIST_CLIENT_PAGE: Error fetching product details:", err);
        setError("Could not load all wishlist items. Please try refreshing the page.");
        setWishlistProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist, isWishlistContextLoading]);


  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  const isLoadingPage = isWishlistContextLoading || isLoadingProducts;

  if (isLoadingPage) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
            <HeartSolidIcon className="h-16 w-16 text-gray-200 mb-4"/>
            <p className="text-gray-500 text-lg">Loading your saved items...</p>
        </div>
      </div>
    );
  }

  return ( 
    <div className="container mx-auto px-4 py-8 sm:py-12 min-h-[calc(100vh-400px)]">
      {error && (
        <div className="text-center py-10 bg-red-50 text-red-600 p-4 rounded-md shadow mb-8" role="alert">
          <p className="font-semibold">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}
      
      {!error && wishlistProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-lg p-8 mt-8 max-w-lg mx-auto">
          <HeartSolidIcon className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-6"/>
          <h2 className="text-2xl font-semibold text-graphite mb-3">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-8">Save your favorite items here to easily find them later.</p>
          <Link href="/products" className="inline-block px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all">
            Discover Products
          </Link>
        </div>
      ) : !error && wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link href={`/products/${product.id}`} className="block relative w-full h-64 overflow-hidden bg-gray-100 group/image">
                  {product.imageUrl ? (
                    <NextImage 
                      src={product.image_url} 
                      alt={product.name || 'Product image'} 
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 ease-in-out group-hover/image:scale-105"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-sm font-medium p-4 text-center bg-gray-50">
                      <svg className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Image Not Available</span>
                    </div>
                  )}
              </Link>
              
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-md font-semibold text-graphite mb-1 line-clamp-2 group-hover:text-solar-flare-start transition-colors" style={{minHeight: '2.8em'}}>
                  <Link href={`/products/${product.id}`}>{product.name}</Link>
                </h3>
                
                {product.wattage != null && (
                  <p className="text-xs text-gray-500 mb-2">{product.wattage}W Panel</p>
                )}
                
                <p className="text-lg font-bold text-deep-night mb-4">
                  Ksh {product.price.toLocaleString()}
                </p>
                
                <div className="mt-auto space-y-2 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleMoveToCart(product)}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-md hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <ShoppingCartIcon className="h-4 w-4 mr-2"/> 
                    Move to Cart
                  </button>
                  
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors shadow-sm"
                  >
                    <TrashIcon className="h-4 w-4 mr-2"/> 
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default WishlistClientPage;