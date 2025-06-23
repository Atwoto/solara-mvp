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
import ScrollToTopButton from '@/components/ScrollToTopButton';
import AuthProvider from '@/components/AuthProvider'; 
import './globals.css';

// --- Global styles ---
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Define our distinct layout zones
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  
  // Determine if the main layout (Header, Footer, etc.) should be shown
  const showMainLayout = !isAdminPage && !isAuthPage;

  return (
    // THIS IS THE ONLY CHANGE: added className="scroll-smooth"
    <html lang="en" className="scroll-smooth"> 
      <head>
        <title>Bills On Solar EA Limited</title>
        <meta name="description" content="Powering Your Tomorrow Sustainably with Solar Energy Solutions in Kenya." />
      </head>
      <body className="flex flex-col min-h-screen bg-cloud-white text-graphite">
        <AuthProvider> 
          {showMainLayout ? (
            // --- MAIN SITE LAYOUT ---
            <CartProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  
                  {/* Sticky container for both TopBar and Header */}
                  <div className="sticky top-0 z-50 w-full">
                    <TopBar />
                    <Header />
                  </div>
                  
                  {/* 
                    Main content area with padding to avoid being hidden by the sticky header group.
                    The `relative z-10` ensures dropdown menus from the header appear ON TOP of this content.
                  */}
                  <main className="flex-grow pt-[96px] lg:pt-[108px] relative z-10"> 
                    {children} 
                  </main>

                  {/* Floating Action Buttons and Global Components */}
                  <Chatbot />
                  <WhatsAppButton />
                  <ScrollToTopButton />
                  <Footer /> 
                  <ScrollProgress />

                </ComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          ) : (
            // --- AUTH & ADMIN LAYOUT (Clean slate) ---
            <>
              {children}
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}