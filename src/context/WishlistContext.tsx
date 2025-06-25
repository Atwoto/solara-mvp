'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { Product } from '@/types'; // Make sure you have a 'Product' type defined

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[]; // The new state to hold full product objects
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const { data: session, status } = useSession();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]); // New state
  const [isLoading, setIsLoading] = useState(true);

  // --- Step 1: Fetch the list of Wishlist IDs ---
  const fetchWishlistIds = useCallback(async () => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      setWishlistIds([]);
      setWishlistProducts([]); // Also clear products when logged out
      return;
    }
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist IDs');
      const data: string[] = await response.json();
      setWishlistIds(data);
    } catch (error) {
      console.error('WishlistContext Error:', error);
      setWishlistIds([]);
    }
  }, [status]);

  // --- Step 2: Fetch full Product Details when IDs change ---
  const fetchWishlistProducts = useCallback(async () => {
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      setIsLoading(false);
      return; // No need to fetch if the wishlist is empty
    }
    
    setIsLoading(true);
    try {
      // We need an API endpoint that can fetch multiple products by their IDs
      // Example: /api/products?ids=id1,id2,id3
      const response = await fetch(`/api/products?ids=${wishlistIds.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch product details');
      const products: Product[] = await response.json();
      setWishlistProducts(products);
    } catch (error) {
      console.error('Failed to fetch wishlist products:', error);
      setWishlistProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  }, [wishlistIds]);

  // Effect to fetch IDs when the user's session status changes
  useEffect(() => {
    fetchWishlistIds();
  }, [status, fetchWishlistIds]);

  // Effect to fetch products when the list of IDs changes
  useEffect(() => {
    fetchWishlistProducts();
  }, [wishlistIds, fetchWishlistProducts]);

  const addToWishlist = async (productId: string) => {
    if (status !== 'authenticated') {
      // Optionally redirect to login or show a message
      console.log('User must be logged in to add to wishlist');
      return;
    }
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    // Re-fetch the list of IDs to update the state
    await fetchWishlistIds();
  };

  const removeFromWishlist = async (productId: string) => {
    if (status !== 'authenticated') return;
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    // Re-fetch the list of IDs to update the state
    await fetchWishlistIds();
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const value = {
    wishlistIds,
    wishlistProducts, // Provide the new array to the rest of the app
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};