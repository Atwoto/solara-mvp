// app/layout.tsx
'use client'; 

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ComparisonProvider } from '@/context/ComparisonContext';
import Header from '@/components/Header';
import { TopBar } from '@/components/layout/TopBar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollToTopButton from '@/components/ScrollToTopButton'; // You might have renamed/removed this for ScrollProgress
import AuthProvider from '@/components/AuthProvider'; 
import './globals.css';

// --- Global styles ---
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  
  const showMainLayout = !isAdminPage && !isAuthPage;

  return (
    <html lang="en" className="scroll-smooth"> 
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
                  
                  <div className="sticky top-0 z-50 w-full">
                    <TopBar />
                    <Header />
                  </div>
                  
                  {/* 
                    THE FIX: Removed pt-[96px] and lg:pt-[108px]
                    This allows the page content (like PageHeader) to sit flush against the sticky header.
                  */}
                  <main className="flex-grow relative z-10"> 
                    {children} 
                  </main>

                  <Chatbot />
                  <ScrollToTopButton />
                  <WhatsAppButton />
                  <ScrollProgress /> {/* This is our new, impressive version */}
                  <Footer /> 

                </ComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          ) : (
            <>
              {children}
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}