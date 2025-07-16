// /src/components/ProductDetailClient.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product as ProductType } from '@/types';
import { CheckIcon, HeartIcon as HeartSolid, ShoppingCartIcon, PhoneArrowUpRightIcon, WrenchScrewdriverIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: ProductType;
  initialIsWishlisted: boolean;
}

export default function ProductDetailClient({ product, initialIsWishlisted }: ProductDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isLoading: isWishlistLoading } = useWishlist();

  const [selectedImageUrl, setSelectedImageUrl] = useState(product.image_url?.[0] || '');
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleWishlistToggle = async () => {
    if (!session) {
      alert('Please log in to add items to your wishlist.');
      router.push('/login');
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(product.id);
      setIsWishlisted(false);
    } else {
      await addToWishlist(product.id);
      setIsWishlisted(true);
    }
  };
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Column */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <AnimatePresence mode="wait">
                {selectedImageUrl && (
                  <motion.div
                    key={selectedImageUrl}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    <img
                      src={selectedImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {product.image_url && product.image_url.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto p-2">
                {product.image_url.map((url) => (
                  <button
                    key={url}
                    onClick={() => setSelectedImageUrl(url)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200
                      ${selectedImageUrl === url ? 'ring-2 ring-solar-flare-start ring-offset-2' : 'hover:opacity-80'}`
                    }
                  >
                    <img src={url} alt={`${product.name} thumbnail`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-deep-night mb-4">{product.name}</h1>
            
            {product.price > 0 ? (
              <p className="text-3xl font-bold text-solar-flare-end mb-6">
                Ksh {product.price.toLocaleString()}
              </p>
            ) : (
              <p className="text-2xl font-bold text-gray-700 mb-6">
                Price available on request
              </p>
            )}

            <div
              className="prose max-w-none text-gray-600 mb-8"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />

            <div className="flex items-center space-x-4 mt-auto pt-8 border-t">
              {product.price > 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`w-full px-6 py-3 text-md font-semibold text-white rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors ${
                    addedToCart ? 'bg-green-500' : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90'
                  }`}
                >
                  {addedToCart ? <CheckIcon className="h-6 w-6" /> : <ShoppingCartIcon className="h-6 w-6" />}
                  {addedToCart ? 'Added to Cart' : 'Add to Cart'}
                </button>
              ) : (
                <Link
                  href="/#contact-us"
                  className="w-full px-6 py-3 text-md font-semibold text-white bg-deep-night hover:bg-gray-800 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneArrowUpRightIcon className="h-6 w-6" />
                  Get a Custom Quote
                </Link>
              )}
              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                className="p-3 rounded-full border-2 hover:bg-red-50 disabled:opacity-50"
              >
                {isWishlisted ? <HeartSolid className="h-6 w-6 text-red-500" /> : <HeartOutline className="h-6 w-6 text-gray-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      {product.features && product.features.length > 0 && (
          <div className="bg-gray-50 border-y">
            <div className="container mx-auto px-4 py-16">
                 <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-deep-night text-center mb-8">Key Features & Specifications</h2>
                    <ul className="space-y-3">
                        {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start bg-white p-4 rounded-lg border shadow-sm">
                                <CheckBadgeIcon className="h-6 w-6 text-green-500 mr-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    {typeof feature === 'object' && feature.title ? (
                                        <>
                                            <span className="font-semibold text-gray-800">{feature.title}:</span>
                                            <span className="text-gray-600 ml-1.5">{feature.detail}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-600">{feature.toString()}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                 </div>
            </div>
          </div>
      )}
    </div>
  );
}