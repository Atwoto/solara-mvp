// src/app/wishlist/page.tsx
// This file is a Server Component by default (NO 'use client' directive at the top)

import WishlistClientPage from './WishlistClientPage'; // Import the client component we just defined
import PageHeader from '@/components/PageHeader';     // Assuming PageHeader is suitable for Server Component use
import { Metadata } from 'next';                     // Import Metadata type for better type checking

// --- METADATA EXPORT FOR APP ROUTER ---
export const metadata: Metadata = {
  title: 'My Wishlist - Bills On Solar',
  description: 'View and manage your saved solar products for future consideration at Bills On Solar EA Limited.',
  openGraph: { // Example of adding Open Graph data
    title: 'My Wishlist - Bills On Solar',
    description: 'Your saved products for smart solar shopping.',
    // images: ['/images/og-wishlist.jpg'], // You would need to create this image
  },
};
// ------------------------------------

export default function WishlistPageContainer() { // Renamed for clarity, Next.js uses default export for page
  return (
    <>
      {/* PageHeader is rendered here by the Server Component */}
      <PageHeader
        title="My Wishlist"
        subtitle="Your saved products for future consideration."
      />
      
      {/* Render the Client Component that contains all the interactive wishlist logic */}
      <WishlistClientPage />
    </>
  );
}