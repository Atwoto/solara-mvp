// src/context/CartContext.tsx -- FINAL, TYPO-FIXED VERSION
'use client';

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Product as AppProductType } from '@/types'; 

export interface CartItem extends AppProductType { 
  quantity: number;
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status: authStatus } = useSession();

  const fetchDbCart = useCallback(async () => {
    if (authStatus !== 'authenticated') {
        setCartItems([]);
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error(`Failed to fetch cart (${response.status})`);
      setCartItems(await response.json());
    } catch (err: any) {
      console.error("CART_CONTEXT: Error fetching DB cart:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchDbCart();
    } else if (authStatus === 'unauthenticated') {
      const localCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);
      setCartItems(localCart ? JSON.parse(localCart) : []);
      setIsLoading(false);
    }
  }, [authStatus, fetchDbCart]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, authStatus]);
  
  useEffect(() => {
    const mergeCart = async () => {
        if (authStatus === 'authenticated') {
            const guestCartItems: CartItem[] = JSON.parse(localStorage.getItem(GUEST_CART_STORAGE_KEY) || '[]');
            if (guestCartItems.length > 0) {
                await Promise.all(guestCartItems.map(item => 
                    fetch('/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
                    })
                ));
                localStorage.removeItem(GUEST_CART_STORAGE_KEY);
                await fetchDbCart();
            }
        }
    };
    mergeCart();
  }, [authStatus, fetchDbCart]);


    const addToCart = async (product: AppProductType, quantityToAdd: number = 1) => {
    setError(null);
    if (authStatus === 'authenticated') {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: quantityToAdd }),
        });
        if (!response.ok) {
            // Try to get a more specific error message from the server
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.error || `Server responded with ${response.status}`);
        }
        // If the POST is successful, re-fetch the entire cart to ensure consistency
        await fetchDbCart();
      } catch (err: any) {
        console.error("Error adding to DB cart:", err);
        setError(err.message);
      }
    } else { // Guest logic (this part works fine)
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantityToAdd } : i);
        return [...prev, { ...product, quantity: quantityToAdd }];
      });
    }
    openCart();
  };

  const removeFromCart = async (productId: string) => {
    setError(null);
    if (authStatus === 'authenticated') {
      try {
        const response = await fetch('/api/cart', { 
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        if (!response.ok) throw new Error(`Failed to remove item (${response.status})`);
        await fetchDbCart();
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    setError(null);
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (authStatus === 'authenticated') {
      try {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, newQuantity }),
        });
        if (!response.ok) throw new Error(`Failed to update quantity (${response.status})`);
        await fetchDbCart();
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setCartItems((prev) => prev.map((item) => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const clearCart = async () => {
    setError(null);
    if (authStatus === 'authenticated') {
      try {
        const response = await fetch('/api/cart', { 
            method: 'DELETE',
        }); 
        if (!response.ok) throw new Error(`Failed to clear cart (${response.status})`);
        setCartItems([]);
      } catch (err: any) {
        setError(err.message);
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