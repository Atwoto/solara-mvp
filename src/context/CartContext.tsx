// src/context/CartContext.tsx
'use client';

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Product as AppProductType } from '@/types'; 
import { useRouter } from 'next/navigation'; // Added for login redirect if needed

// This interface is used throughout your app for items in the cart
export interface CartItem extends AppProductType { 
  quantity: number;
}

// Defines the shape of the data and functions provided by the context
interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean; 
  error: string | null;
  addToCart: (product: AppProductType, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateItemQuantity: (productId: string, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getTotalItems: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const GUEST_CART_STORAGE_KEY = 'billsOnSolarGuestCart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start as true for initial load
  const [error, setError] = useState<string | null>(null);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // This function is the single source of truth for fetching an authenticated user's cart from the database.
  const fetchDbCart = useCallback(async () => {
    if (authStatus !== 'authenticated') {
        setCartItems([]);
        setIsLoading(false);
        return;
    }
    
    console.log("CART_CONTEXT: Fetching DB cart...");
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cart'); // GET request
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch cart (${response.status})`);
      }
      const dbCartItems: CartItem[] = await response.json();
      console.log("CART_CONTEXT: Successfully fetched DB cart items:", dbCartItems);
      setCartItems(dbCartItems);
    } catch (err: any) {
      console.error("CART_CONTEXT: Error fetching DB cart:", err);
      setError(err.message);
      setCartItems([]); 
    } finally {
      setIsLoading(false);
    }
  }, [authStatus]);

  // Load initial cart state based on authentication status
  useEffect(() => {
    console.log(`CART_CONTEXT: Auth status changed to: ${authStatus}.`);
    if (authStatus === 'authenticated') {
      fetchDbCart();
    } else if (authStatus === 'unauthenticated') {
      try {
        const localCartJson = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (localCartJson) {
          const parsedCart = JSON.parse(localCartJson);
          if (Array.isArray(parsedCart)) {
            console.log("CART_CONTEXT: Loading guest cart from localStorage.", parsedCart);
            setCartItems(parsedCart);
          }
        } else {
          setCartItems([]); 
        }
      } catch (e) {
        console.error("CART_CONTEXT: Error loading guest cart from localStorage:", e);
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        setCartItems([]);
      }
      setIsLoading(false);
    }
    // If authStatus is 'loading', isLoading remains true
  }, [authStatus, fetchDbCart]);

  // Sync guest cart to localStorage whenever it changes
  useEffect(() => {
    if (authStatus === 'unauthenticated' && typeof window !== 'undefined') {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, authStatus]);

  // Merge guest cart to DB on login
  useEffect(() => {
    const mergeCart = async () => {
        if (authStatus === 'authenticated') {
            const localCartJson = localStorage.getItem(GUEST_CART_STORAGE_KEY);
            if (localCartJson) {
                const guestCartItems: CartItem[] = JSON.parse(localCartJson);
                if (guestCartItems.length > 0) {
                    console.log("CART_CONTEXT: Guest cart detected, merging with DB cart...");
                    setIsLoading(true);
                    try {
                        // Use Promise.all to send all merge requests concurrently
                        await Promise.all(guestCartItems.map(item => 
                            fetch('/api/cart', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
                            })
                        ));
                        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
                        await fetchDbCart(); // Re-fetch the fully merged cart
                        console.log("CART_CONTEXT: Guest cart merged and cleared.");
                    } catch (mergeError) {
                        console.error("CART_CONTEXT: Error merging guest cart to DB:", mergeError);
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                     localStorage.removeItem(GUEST_CART_STORAGE_KEY);
                }
            }
        }
    };
    mergeCart();
  }, [authStatus, fetchDbCart]);


  const addToCart = async (product: AppProductType, quantityToAdd: number = 1) => {
    setError(null);
    if (authStatus === 'authenticated') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: quantityToAdd }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(()=>({}));
            throw new Error(errData.error || `Failed to add item (${response.status})`);
        }
        await fetchDbCart(); // <<< FIX: Re-fetch the cart from the DB
      } catch (err: any) {
        console.error("Error adding to DB cart:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else { // Guest user logic
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
          );
        }
        return [...prevItems, { ...product, quantity: quantityToAdd }];
      });
    }
    openCart();
  };

  const removeFromCart = async (productId: string) => {
    setError(null);
    if (authStatus === 'authenticated') {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/cart/item?productId=${productId}`, { method: 'DELETE' });
        if (!response.ok) { throw new Error(`Failed to remove item (${response.status})`); }
        await fetchDbCart(); // <<< FIX: Re-fetch the cart from the DB
      } catch (err: any) {
        console.error("Error removing from DB cart:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    setError(null);
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (authStatus === 'authenticated') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cart/item', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, newQuantity }),
        });
        if (!response.ok) { throw new Error(`Failed to update quantity (${response.status})`); }
        await fetchDbCart(); // <<< FIX: Re-fetch the cart from the DB
      } catch (err: any) {
        console.error("Error updating DB cart item quantity:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    setError(null);
    if (authStatus === 'authenticated') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cart', { method: 'DELETE' });
        if (!response.ok) { throw new Error(`Failed to clear cart (${response.status})`); }
        setCartItems([]); // Clear local state immediately after DB success
      } catch (err: any) {
        console.error("Error clearing DB cart:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else { 
      setCartItems([]);
    }
  };

  const getCartTotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prevState => !prevState);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, isLoading, error,
        addToCart, removeFromCart, updateItemQuantity, clearCart,
        getCartTotal, getTotalItems,
        isCartOpen, openCart, closeCart, toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};