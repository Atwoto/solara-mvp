// src/components/ProductCatalog.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useComparison } from '@/context/ComparisonContext';
import { motion } from 'framer-motion';
import { CheckIcon, HeartIcon as HeartSolid, ArrowsRightLeftIcon as ArrowsRightLeftSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ArrowsRightLeftIcon as ArrowsRightLeftOutline, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product as ProductType } from '@/types';

// Animation variants for the container and items
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface ProductCatalogProps {
  limit?: number;
  category?: string;
  showTitle?: boolean;
  showExploreButton?: boolean;
  gridCols?: string;
  sectionBg?: string;
  titleText?: string;
}

const ProductCatalog = ({ 
  limit, category, showTitle = true, showExploreButton = true,
  gridCols = 'lg:grid-cols-3 xl:grid-cols-4',
  sectionBg = 'bg-white',
  titleText = 'Featured Products'
}: ProductCatalogProps) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { comparisonItems, toggleComparison, isInComparison, MAX_COMPARISON_ITEMS } = useComparison(); 
  const { data: session } = useSession();
  const router = useRouter();
  
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actualTitle = category 
    ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
    : titleText;

  useEffect(() => {
    // --- Data fetching logic remains the same ---
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      let apiUrl = '/api/products';
      if (category) apiUrl += `?category=${encodeURIComponent(category)}`;

      try {
        const response = await fetch(apiUrl); 
        if (!response.ok) throw new Error(`Failed to fetch products`);
        setProducts(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const handleAddToCart = (product: ProductType) => {
    addToCart(product);
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); // Prevent link navigation
    if (!session) {
      alert('Please log in to use the wishlist.');
      router.push('/login');
      return;
    }
    wishlist.includes(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
  };

  const handleCompareToggle = (e: React.MouseEvent, product: ProductType) => {
    e.preventDefault(); // Prevent link navigation
    toggleComparison(product);
  };

  const productsToDisplay = limit ? products.slice(0, limit) : products;

  // --- Render states ---
  if (isLoading) return <div className={`${sectionBg} py-24 text-center text-gray-500`}>Loading Products...</div>;
  if (error) return <div className={`${sectionBg} py-24 text-center text-red-500`}>Error: Could not load products.</div>;

  return (
    <section className={`${sectionBg} py-20 sm:py-28`}>
      <div className="container px-4 mx-auto">
        {showTitle && (
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-graphite tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-solar-flare-start to-solar-flare-end">{actualTitle}</span>
            </h2>
          </div>
        )}
        
        {productsToDisplay.length === 0 && <div className="text-center py-10 text-gray-500">No products found.</div>}

        {productsToDisplay.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 ${gridCols}`}
          >
            {productsToDisplay.map((product, index) => {
              const inWishlist = wishlist.includes(product.id);
              const isComparing = isInComparison(product.id);

              return (
                <motion.div key={product.id} variants={itemVariants}>
                  <Link href={`/products/${product.id}`} className="block relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    {/* --- Image and Default Info --- */}
                    <div className="relative w-full h-72 bg-gray-200">
                      {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority={index < 4} />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-5">
                          <h3 className="text-lg font-bold text-white text-shadow-md line-clamp-2">{product.name}</h3>
                          {product.wattage != null && <p className="mt-1 text-xs text-white/80">{product.wattage}W Panel</p>}
                      </div>
                    </div>

                    {/* --- THE "WOW" FACTOR: Action Panel Reveal on Hover --- */}
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-white/80 backdrop-blur-md transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                        <div className="flex items-end justify-between">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-deep-night">Ksh {product.price.toLocaleString()}</span>
                            <div className="flex items-center space-x-2 mt-2">
                                <button onClick={(e) => handleWishlistToggle(e, product.id)} title={inWishlist ? "In Wishlist" : "Add to Wishlist"} className="p-2 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50" disabled={isWishlistLoading}>
                                    {inWishlist ? <HeartSolid className="h-5 w-5 text-red-500"/> : <HeartOutline className="h-5 w-5 text-gray-600"/>}
                                </button>
                                <button onClick={(e) => handleCompareToggle(e, product)} title={isComparing ? "Comparing" : "Add to Compare"} className="p-2 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50" disabled={!isComparing && comparisonItems.length >= MAX_COMPARISON_ITEMS}>
                                    {isComparing ? <ArrowsRightLeftSolid className="h-5 w-5 text-solar-flare-end"/> : <ArrowsRightLeftOutline className="h-5 w-5 text-gray-600"/>}
                                </button>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                            className={`px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                              addedToCartId === product.id 
                                ? 'bg-green-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:shadow-lg'
                            }`}
                            disabled={addedToCartId === product.id}
                          >
                            {addedToCartId === product.id ? <CheckIcon className="h-5 w-5"/> : <ShoppingCartIcon className="h-5 w-5" />}
                            {addedToCartId === product.id ? 'Added' : 'Add to Cart'}
                          </button>
                        </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {showExploreButton && products.length > (limit || 0) && (
          <div className="mt-16 text-center">
            <Link href="/products" className="inline-block px-10 py-3 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
                Explore All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;