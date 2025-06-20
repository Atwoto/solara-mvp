// src/app/layout.tsx
'use client'; 

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ComparisonProvider } from '@/context/ComparisonContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import ScrollProgress from '@/components/ScrollProgress';
import AuthProvider from '@/components/AuthProvider'; 
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // Header height is 60px based on inspection
  const mainPaddingTopClass = isAdminPage ? '' : 'pt-[60px]'; 

  return (
    <html lang="en">
      <head>
        <title>Bills On Solar EA Limited</title>
        <meta name="description" content="Powering Your Tomorrow Sustainably with Solar Energy Solutions in Kenya." />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 text-graphite">
        <AuthProvider> 
          {isAdminPage ? (
            <>{children}</> 
          ) : (
            <CartProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  <Header />
                  <main className={`flex-grow ${mainPaddingTopClass}`}> 
                    {children} 
                  </main>
                  <Chatbot />
                  <Footer /> 
                  <ScrollProgress />
                </ComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}