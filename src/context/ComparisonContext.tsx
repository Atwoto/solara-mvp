// src/context/ComparisonContext.tsx
'use client';

import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Product } from '@/types'; // <<--- IMPORT THE CENTRAL Product TYPE

// REMOVE THE LOCAL Product INTERFACE DEFINITION FROM HERE
// export interface Product {
//   id: string;
//   name: string;
//   price: number;
//   wattage?: number; 
//   category?: string; 
//   imageUrl?: string; 
//   description?: string; 
// }

interface ComparisonContextType {
  comparisonItems: Product[]; // Now uses the imported Product type
  toggleComparison: (product: Product) => void; // Now uses the imported Product type
  removeFromComparison: (productId: string) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
  MAX_COMPARISON_ITEMS: number;
}

const MAX_COMPARISON_ITEMS = 3; // Or 4, choose a sensible limit

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparisonItems, setComparisonItems] = useState<Product[]>([]);

  const isInComparison = useCallback((productId: string) => {
    return comparisonItems.some(item => item.id === productId);
  }, [comparisonItems]);

  const toggleComparison = useCallback((product: Product) => { // Parameter 'product' is now the imported Product type
    setComparisonItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        // Already exists, so remove it
        return prevItems.filter(item => item.id !== product.id);
      } else {
        // Doesn't exist, add it if not exceeding max limit
        if (prevItems.length < MAX_COMPARISON_ITEMS) {
          return [...prevItems, product];
        } else {
          alert(`You can only compare up to ${MAX_COMPARISON_ITEMS} items at a time. Please remove an item to add a new one.`);
          return prevItems;
        }
      }
    });
  }, [comparisonItems]); // Removed MAX_COMPARISON_ITEMS from dependencies as it's a constant defined outside

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonItems([]);
  }, []);

  return (
    <ComparisonContext.Provider value={{ 
      comparisonItems, 
      toggleComparison, 
      removeFromComparison,
      isInComparison, 
      clearComparison,
      MAX_COMPARISON_ITEMS
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};