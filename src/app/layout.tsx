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

// <<--- NEW: Define paths that should NOT have top padding ---
// These are pages that have their own full-width colored header backgrounds.
const NO_PADDING_PATHS = [
  '/services',
  '/about',
  '/contact',
  // Add any other paths here, e.g., '/projects' if it uses PageHeader
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // <<--- NEW: Check if the current page is one of the special full-width pages ---
  const isFullWidthPage = NO_PADDING_PATHS.some(path => pathname.startsWith(path));

  // <<--- UPDATED: The logic for applying top padding ---
  // Apply padding only if it's NOT an admin page AND NOT a full-width page.
  // I've also added a larger padding for desktop (lg) as good practice. Adjust if needed.
  const mainPaddingTopClass = isAdminPage || isFullWidthPage
    ? '' 
    : 'pt-[60px] lg:pt-[72px]'; 

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
                  {/* The mainPaddingTopClass is now conditionally applied here */}
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