// src/app/page.tsx
'use client'; // This page now needs to be a client component to fetch data

import { useState, useEffect } from 'react';
import { Product } from '@/types'; // Import the Product type

// Import all your impressive components
import Hero from '@/components/Hero';
import InteractiveShowcase from '@/components/InteractiveShowcase';
import StatsCounter from '@/components/StatsCounter';
import ProductCatalog from '@/components/ProductCatalog';
import WhyChooseUs from '@/components/WhyChooseUs';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import PartnersSection from '@/components/PartnersSection';
import TestimonialSlider from '@/components/TestimonialSlider';
import LatestArticles from '@/components/LatestArticles';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Head from 'next/head';
import Link from 'next/link';

export default function HomePage() {
  // State to hold the featured products for the homepage
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect to fetch a limited number of products for the homepage
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch only 6 products for the homepage feature section
        const response = await fetch('/api/products?limit=6');
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }
        setFeaturedProducts(await response.json());
      } catch (error) {
        console.error(error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <Head>
        <title>Bills On Solar EA Limited - Affordable Solar Energy Solutions</title>
        <meta name="description" content="Powering your tomorrow with reliable and affordable solar energy solutions in Kenya. Explore our range of solar panels, inverters, and more." />
      </Head>
      
      <Hero />
      <ScrollAnimationWrapper><InteractiveShowcase /></ScrollAnimationWrapper>
      <ScrollAnimationWrapper><StatsCounter /></ScrollAnimationWrapper>

      {/* --- THE FIX: The Product Catalog section is now self-contained --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container mx-auto px-4">
          {/* Title is now handled by the page itself */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-graphite tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-solar-flare-start to-solar-flare-end">
                Our Featured Products
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover a selection of our top-rated solar panels, inverters, and batteries.
            </p>
          </div>
          
          {/* The ProductCatalog component now receives the fetched products */}
          {isLoading ? (
            <div className="text-center">Loading products...</div> // Or a skeleton loader
          ) : (
            <ProductCatalog 
              products={featuredProducts} 
              gridCols="lg:grid-cols-3" 
            />
          )}

          {/* The "Explore All" button is also handled by the page */}
          <div className="mt-16 text-center">
            <Link href="/products" className="inline-block px-10 py-3 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
              Explore All Products
            </Link>
          </div>
        </div>
      </section>

      <section id="about-us"><ScrollAnimationWrapper><AboutSection /></ScrollAnimationWrapper></section>
      <ScrollAnimationWrapper><WhyChooseUs /></ScrollAnimationWrapper>
      <ScrollAnimationWrapper><PartnersSection /></ScrollAnimationWrapper>
      <section id="contact-us"><ScrollAnimationWrapper><ContactSection /></ScrollAnimationWrapper></section>
      <ScrollAnimationWrapper><TestimonialSlider /></ScrollAnimationWrapper>
      <section id="blog"><ScrollAnimationWrapper><LatestArticles /></ScrollAnimationWrapper></section>
    </>
  );
}