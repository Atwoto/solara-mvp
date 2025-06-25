'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { Product } from '@/types';

// Define the shape of the context data
interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => Promise<void>; // Added for the chatbot
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
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetches the list of product IDs in the wishlist
  const fetchWishlistIds = useCallback(async () => {
    if (status !== 'authenticated') {
      setWishlistIds([]);
      return;
    }
    try {
      const response = await fetch('/api/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist IDs');
      const data: string[] = await response.json();
      setWishlistIds(data);
    } catch (error) {
      console.error('WishlistContext Error fetching IDs:', error);
      setWishlistIds([]);
    }
  }, [status]);

  // Fetches the full product details based on the list of IDs
  const fetchWishlistProducts = useCallback(async () => {
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?ids=${wishlistIds.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch product details');
      const products: Product[] = await response.json();
      setWishlistProducts(products);
    } catch (error) {
      console.error('Failed to fetch wishlist products:', error);
      setWishlistProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [wishlistIds]);

  // Initial fetch and re-fetch on login/logout
  useEffect(() => {
    fetchWishlistIds();
  }, [status, fetchWishlistIds]);

  // Re-fetch products whenever the IDs change
  useEffect(() => {
    fetchWishlistProducts();
  }, [wishlistIds, fetchWishlistProducts]);

  // Function to add an item
  const addToWishlist = async (productId: string) => {
    if (status !== 'authenticated') return;
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    await fetchWishlistIds(); // Re-fetch to update state
  };

  // Function to remove an item
  const removeFromWishlist = async (productId: string) => {
    if (status !== 'authenticated') return;
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    await fetchWishlistIds(); // Re-fetch to update state
  };

  // --- NEW FUNCTION ---
  // Function to clear the entire wishlist
  const clearWishlist = async () => {
    if (status !== 'authenticated') return;
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Empty body signals "clear all" to the API
    });
    await fetchWishlistIds(); // Re-fetch to update state
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const value = {
    wishlistIds,
    wishlistProducts,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    clearWishlist, // Provide the new function
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};