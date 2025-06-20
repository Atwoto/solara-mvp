// src/context/WishlistContext.tsx
'use client';

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// This is the expected shape of items returned by the GET /api/wishlist endpoint
export interface WishlistApiResponseItem {
  product_id: string; 
}

interface WishlistContextType {
  wishlist: string[]; // Array of product IDs
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  isLoading: boolean;
  wishlistCount: number;
  error: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter(); 

  // --- START OF FIX: This function is now the single source of truth for wishlist state ---
  const fetchUserWishlist = useCallback(async () => {
    if (authStatus !== 'authenticated' || !session?.user) {
      setWishlist([]); 
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/wishlist'); 
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load wishlist (${response.status})`);
      }
      const data: WishlistApiResponseItem[] = await response.json();
      
      const validProductIds = data
        .map((item) => item.product_id)
        .filter((id): id is string => !!id);
      
      console.log("WISHLIST_CONTEXT: Fetched and validated wishlist IDs:", validProductIds);
      setWishlist(validProductIds);

    } catch (err: any) {
      console.error("WISHLIST_CONTEXT: Error fetching user wishlist:", err);
      setError(err.message || "An unexpected error occurred while fetching wishlist.");
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [authStatus, session]);

  useEffect(() => {
    // Initial fetch when auth status is determined
    if (authStatus === 'authenticated') {
      fetchUserWishlist();
    } else if (authStatus === 'unauthenticated') {
      setWishlist([]); 
      setIsLoading(false);
    }
  }, [authStatus, fetchUserWishlist]);


  const addToWishlist = async (productId: string) => {
    if (authStatus !== 'authenticated') {
      alert('Please log in to add items to your wishlist.');
      router.push('/login');
      return;
    }
    if (wishlist.includes(productId)) {
        console.log("Item already in wishlist.");
        return; 
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add item to wishlist (${response.status})`);
      }
      // Re-fetch the entire wishlist to get the latest state from the DB
      await fetchUserWishlist();
    } catch (err: any) {
      console.error("Error adding to wishlist:", err);
      setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (authStatus !== 'authenticated') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to remove item from wishlist (${response.status})`);
      }
      // Re-fetch the entire wishlist to get the latest state from the DB
      await fetchUserWishlist();
    } catch (err: any) {
      console.error("Error removing from wishlist:", err);
      setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };
  // --- END OF FIX ---


  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const clearWishlist = async () => {
    if (authStatus !== 'authenticated') return;
    setIsLoading(true);
    setError(null);
    try {
        // You would need a specific API endpoint to delete all items for a user
        // e.g., await fetch('/api/wishlist/all', { method: 'DELETE' });
        // For now, this is a placeholder that only clears the client state
        console.warn("Clearing wishlist (client-side only). Implement backend clearing.");
        setWishlist([]);
    } catch (err: any) {
        console.error("Error clearing wishlist:", err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      clearWishlist,
      isInWishlist,
      isLoading,
      wishlistCount: wishlist.length,
      error
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};