// src/app/wishlist/WishlistClientPage.tsx
'use client'; 

import { useEffect, useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon as HeartSolidIcon, CheckIcon } from '@heroicons/react/24/solid';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
} as const;


const WishlistClientPage = () => {
  const { wishlist, isLoading: isWishlistLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movedToCartId, setMovedToCartId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (isWishlistLoading) return setIsLoadingProducts(true);
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return setIsLoadingProducts(false);
      }
      setIsLoadingProducts(true);
      try {
        const productDetailsPromises = wishlist.map(id => fetch(`/api/product-details?id=${id}`).then(res => res.ok ? res.json() : null));
        const resolvedProducts = await Promise.all(productDetailsPromises);
        setWishlistProducts(resolvedProducts.filter(p => p) as Product[]);
      } catch (err) { 
        setError("Could not load all wishlist items.");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlist, isWishlistLoading]);

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    setMovedToCartId(product.id);
  };

  const isLoadingPage = isWishlistLoading || isLoadingProducts;

  if (isLoadingPage) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
            <HeartSolidIcon className="h-16 w-16 text-gray-200 mb-4"/>
            <p className="text-gray-500 text-lg">Loading Your Saved Items...</p>
        </div>
      </div>
    );
  }

  return ( 
    <div className="bg-gray-50 min-h-[calc(100vh-300px)] py-12 sm:py-16">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite">
                    My <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">Wishlist</span>
                </h1>
                <p className="mt-3 text-gray-600 max-w-xl mx-auto">Your personal collection of favorite solar products. Ready to make them yours?</p>
            </div>

            {error && (
                <div className="text-center bg-red-50 text-red-600 p-4 rounded-md" role="alert">{error}</div>
            )}
            
            {!error && wishlistProducts.length === 0 ? (
                <div className="text-center bg-white rounded-2xl shadow-lg p-10 mt-8 max-w-lg mx-auto">
                    <HeartSolidIcon className="h-20 w-20 text-gray-200 mx-auto mb-6"/>
                    <h2 className="text-2xl font-semibold text-graphite mb-3">Your Wishlist is a Blank Canvas</h2>
                    <p className="text-gray-500 mb-8">Save your favorite items by clicking the heart icon, and find them here later.</p>
                    <Link href="/products" className="inline-block px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Discover Products
                    </Link>
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
                >
                    <AnimatePresence>
                        {wishlistProducts.map((product) => (
                            <motion.div 
                                key={product.id} 
                                variants={itemVariants}
                                layout
                                exit="exit"
                                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                            >
                                <Link href={`/products/${product.id}`} className="block relative w-full h-60 bg-gray-100">
                                    {product.image_url && (
                                        <NextImage src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    )}
                                </Link>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-md font-semibold text-graphite line-clamp-2" style={{minHeight: '2.8em'}}>
                                        <Link href={`/products/${product.id}`} className="hover:text-solar-flare-start transition-colors">{product.name}</Link>
                                    </h3>
                                    <p className="text-lg font-bold text-deep-night my-3">Ksh {product.price.toLocaleString()}</p>
                                    <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                                        <button 
                                            onClick={() => handleMoveToCart(product)}
                                            disabled={movedToCartId === product.id}
                                            className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-300 ${movedToCartId === product.id ? 'bg-green-500' : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90'}`}
                                        >
                                            {movedToCartId === product.id ? <CheckIcon className="h-5 w-5 mr-2"/> : <ShoppingCartIcon className="h-5 w-5 mr-2"/>}
                                            {/* THE FIX: Corrected the variable name here */}
                                            {movedToCartId === product.id ? 'Moved!' : 'Move to Cart'}
                                        </button>
                                        <button 
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100/70 hover:bg-red-200/70 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="h-5 w-5 mr-2"/> Remove
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    </div>
  );
};

export default WishlistClientPage;