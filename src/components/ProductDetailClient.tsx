// /src/components/ProductDetailClient.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product as ProductType } from '@/types';
import { CheckIcon, HeartIcon as HeartSolid, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

interface ProductDetailClientProps {
  product: ProductType;
  initialIsWishlisted: boolean;
}

export default function ProductDetailClient({ product, initialIsWishlisted }: ProductDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isLoading: isWishlistLoading } = useWishlist();

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
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery Column */}
        <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-lg">
          {/* *** FIX: Use the first image from the array *** */}
          {product.image_url && product.image_url[0] && (
            <Image
              src={product.image_url[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Details Column */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold text-deep-night mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-solar-flare-end mb-6">
            Ksh {product.price.toLocaleString()}
          </p>
          <div className="prose max-w-none text-gray-600 mb-8">
            <p>{product.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-auto pt-8 border-t">
            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`w-full px-6 py-3 text-md font-semibold text-white rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors ${
                addedToCart
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90'
              }`}
            >
              {addedToCart ? (
                <CheckIcon className="h-6 w-6" />
              ) : (
                <ShoppingCartIcon className="h-6 w-6" />
              )}
              {addedToCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              className="p-3 rounded-full border-2 hover:bg-red-50 disabled:opacity-50"
            >
              {isWishlisted ? (
                <HeartSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartOutline className="h-6 w-6 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}