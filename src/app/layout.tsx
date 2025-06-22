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
import ScrollToTopButton from '@/components/ScrollToTopButton';
import AuthProvider from '@/components/AuthProvider'; 
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // 1. DEFINE OUR DISTINCT LAYOUT ZONES
  // These are the routes that will have a clean, header-less, footer-less layout.
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  
  // 2. DETERMINE IF THE MAIN LAYOUT SHOULD BE SHOWN
  // The main layout (with Header/Footer) appears on every page that is NOT an admin or auth page.
  const showMainLayout = !isAdminPage && !isAuthPage;

  return (
    <html lang="en">
      <head>
        <title>Bills On Solar EA Limited</title>
        <meta name="description" content="Powering Your Tomorrow Sustainably with Solar Energy Solutions in Kenya." />
      </head>
      {/*
        BEAUTIFICATION: We're switching from the generic 'bg-gray-50' to our new, brighter
        'bg-cloud-white' for a more modern and premium feel across the entire site.
        This ensures visual consistency with the new login/signup pages.
      */}
      <body className="flex flex-col min-h-screen bg-cloud-white text-graphite">
        <AuthProvider> 
          {showMainLayout ? (
            // --- MAIN SITE LAYOUT ---
            // This renders for pages like Home, Products, About, etc.
            <CartProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  <Header />
                  {/*
                    SIMPLIFIED PADDING: The padding is now applied consistently to all main site pages.
                    This is more robust than maintaining a list of paths. The header's height is fixed,
                    so the content on every page needs to be pushed down by the same amount.
                    Values taken from your original code.
                  */}
                  <main className="flex-grow pt-[60px] lg:pt-[72px]"> 
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
            // --- AUTH & ADMIN LAYOUT ---
            // This renders for /login, /signup, and /admin/*. It's a clean slate.
            // The pages themselves (e.g., LoginPage) are responsible for their own full-screen layout.
            <>
              {children}
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}