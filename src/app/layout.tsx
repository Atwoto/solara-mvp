// src/app/layout.tsx
'use client'; 

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ComparisonProvider } from '@/context/ComparisonContext';
import Header from '@/components/Header';
import { TopBar } from '@/components/layout/TopBar'; // <--- 1. IMPORT THE NEW COMPONENT
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import AuthProvider from '@/components/AuthProvider'; 
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  const showMainLayout = !isAdminPage && !isAuthPage;

  return (
    <html lang="en">
      <head>
        <title>Bills On Solar EA Limited</title>
        <meta name="description" content="Powering Your Tomorrow Sustainably with Solar Energy Solutions in Kenya." />
      </head>
      <body className="flex flex-col min-h-screen bg-cloud-white text-graphite">
        <AuthProvider> 
          {showMainLayout ? (
            <CartProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  
                  {/* --- 2. WRAP TOPBAR AND HEADER IN A STICKY CONTAINER --- */}
                  <div className="sticky top-0 z-50 w-full">
                    <TopBar />
                    <Header />
                  </div>
                  
                  {/*
                    The main content still needs padding, but now it's from the *entire* sticky group.
                    You may need to slightly adjust the `pt-[...]` value to get the spacing perfect.
                    Let's start by adding the TopBar's approximate height (e.g., 36px) to the existing padding.
                    pt-[60px] becomes pt-[96px]
                    pt-[72px] becomes pt-[108px]
                  */}
                  <main className="flex-grow pt-[96px] lg:pt-[108px] relative z-10"> 
                    {children} 
                  </main>

                  <Chatbot />
                  <ScrollToTopButton />
                  <Footer /> 
                  <ScrollProgress />
                </ComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          ) : (
            <>{children}</>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}