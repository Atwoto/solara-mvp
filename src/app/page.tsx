import Hero from '@/components/Hero';
import InteractiveShowcase from '@/components/InteractiveShowcase';
import StatsCounter from '@/components/StatsCounter'; // <-- 1. IMPORT THE NEW COMPONENT
import ProductCatalog from '@/components/ProductCatalog';
import WhyChooseUs from '@/components/WhyChooseUs';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import PartnersSection from '@/components/PartnersSection';
import TestimonialSlider from '@/components/TestimonialSlider';
import LatestArticles from '@/components/LatestArticles';
import AboutSection from '@/components/AboutSection';
import Head from 'next/head';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Bills On Solar EA Limited - Affordable Solar Energy Solutions</title>
        <meta name="description" content="Powering your tomorrow with reliable and affordable solar energy solutions in Kenya. Explore our range of solar panels, inverters, and more." />
      </Head>
      
      <Hero />

      <ScrollAnimationWrapper>
        <InteractiveShowcase />
      </ScrollAnimationWrapper>

      {/* 
        This is the NEW dynamic stats section, placed right after the showcase
        and wrapped in your animation wrapper for a consistent feel.
      */}
      <ScrollAnimationWrapper>
        <StatsCounter />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <ProductCatalog 
          limit={6}
          showTitle={true}
          showExploreButton={true}
          gridCols="lg:grid-cols-3"
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