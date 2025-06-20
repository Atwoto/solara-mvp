// src/app/page.tsx
import Hero from '@/components/Hero';
import InteractiveShowcase from '@/components/InteractiveShowcase';
import ProductCatalog from '@/components/ProductCatalog'; // Your updated ProductCatalog
import WhyChooseUs from '@/components/WhyChooseUs';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import PartnersSection from '@/components/PartnersSection';
import TestimonialSlider from '@/components/TestimonialSlider';
import LatestArticles from '@/components/LatestArticles';
import AboutSection from '@/components/AboutSection';
import Head from 'next/head'; // For page-specific head elements

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Bills On Solar EA Limited - Affordable Solar Energy Solutions</title>
        <meta name="description" content="Powering your tomorrow with reliable and affordable solar energy solutions in Kenya. Explore our range of solar panels, inverters, and more." />
        {/* Add other meta tags like Open Graph, keywords etc. */}
      </Head>
      
      <Hero />

      <ScrollAnimationWrapper>
        <InteractiveShowcase />
      </ScrollAnimationWrapper>

      {/* Use ProductCatalog with limit and other props */}
      <ScrollAnimationWrapper>
        <ProductCatalog 
          limit={6}                 // <<--- Show only 6 products
          showTitle={true}          // <<--- Show "Featured Products" title
          showExploreButton={true}  // <<--- Show "Explore All Products" button
          gridCols="lg:grid-cols-3" // <<--- You can specify grid columns if needed, default is 3
        />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <AboutSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <WhyChooseUs />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <PartnersSection /> 
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <TestimonialSlider />
      </ScrollAnimationWrapper>
      
      <ScrollAnimationWrapper>
        <LatestArticles />
      </ScrollAnimationWrapper>
    </>
  );
}