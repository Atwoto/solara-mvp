'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useComparison } from '@/context/ComparisonContext';
// --- FIX 1: Import the 'Variants' type from framer-motion ---
import { motion, Variants } from 'framer-motion';
import { CheckIcon, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ArrowsRightLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product as ProductType } from '@/types';

// --- FIX 2: Explicitly type the variants object with the 'Variants' type ---
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface ProductCatalogProps {
  products: ProductType[];
  gridCols?: string;
}

const ProductCatalog = ({ 
  products,
  gridCols = 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
}: ProductCatalogProps) => {
  // The rest of your component code is perfectly fine and does not need to be changed.
  if (!products) {
    return null;
  }

  const { addToCart } = useCart();
  const { wishlistIds, addToWishlist, removeFromWishlist, isLoading: isWishlistLoading } = useWishlist();
  const { comparisonItems, toggleComparison, isInComparison, MAX_COMPARISON_ITEMS } = useComparison(); 
  const { data: session } = useSession();
  const router = useRouter();
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);

  const handleAddToCart = (product: ProductType) => {
    addToCart(product);
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); 
    if (!session) {
      alert('Please log in to use the wishlist.');
      router.push('/login');
      return;
    }
    wishlistIds.includes(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
  };

  const handleCompareToggle = (e: React.MouseEvent, product: ProductType) => {
    e.preventDefault(); 
    toggleComparison(product);
  };

  if (products.length === 0) {
    return <div className="text-center py-20 text-gray-500 col-span-full">No products match your current selection.</div>;
  }

  return (
    <div className={`grid grid-cols-1 gap-6 md:gap-8 ${gridCols}`}>
      {products.map((product, index) => {
        const inWishlist = wishlistIds.includes(product.id);
        const isComparing = isInComparison(product.id);

        return (
          <motion.div key={product.id} variants={itemVariants}>
            <Link href={`/products/${product.id}`} className="block relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="relative w-full h-72 bg-gray-200">
                {product.image_url && (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority={index < 4} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5">
                  <h3 className="text-lg font-bold text-white text-shadow-md line-clamp-2">{product.name}</h3>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-white/80 backdrop-blur-md transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-deep-night">Ksh {product.price.toLocaleString()}</span>
                    <div className="flex items-center space-x-2 mt-2">
                        <button onClick={(e) => handleWishlistToggle(e, product.id)} title={inWishlist ? "In Wishlist" : "Add to Wishlist"} className="p-2 rounded-full hover:bg-red-100 disabled:opacity-50" disabled={isWishlistLoading}>
                          {inWishlist ? <HeartSolid className="h-5 w-5 text-red-500"/> : <HeartOutline className="h-5 w-5 text-gray-600"/>}
                        </button>
                        <button onClick={(e) => handleCompareToggle(e, product)} title={isComparing ? "Comparing" : "Add to Compare"} className="p-2 rounded-full hover:bg-orange-100 disabled:opacity-50" disabled={!isComparing && comparisonItems.length >= MAX_COMPARISON_ITEMS}>
                           {isComparing ? <ArrowsRightLeftIcon className="h-5 w-5 text-solar-flare-end"/> : <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600"/>}
                        </button>
                    </div>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); handleAddToCart(product); }} disabled={addedToCartId === product.id} className={`px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md flex items-center gap-2 ${addedToCartId === product.id ? 'bg-green-500' : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end'}`}>
                    {addedToCartId === product.id ? <CheckIcon className="h-5 w-5"/> : <ShoppingCartIcon className="h-5 w-5" />}
                    {addedToCartId === product.id ? 'Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductCatalog;