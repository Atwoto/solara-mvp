// app/page.tsx

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
import ContactSection from '@/components/ContactSection'; // Import the new component
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

      {/* --- ANCHOR #1: ABOUT US --- */}
      <section id="about-us">
        <ScrollAnimationWrapper>
          <AboutSection />
        </ScrollAnimationWrapper>
      </section>

      <ScrollAnimationWrapper>
        <WhyChooseUs />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <PartnersSection /> 
      </ScrollAnimationWrapper>
       {/* --- ANCHOR #3: CONTACT US --- */}
      <section id="contact-us">
        <ScrollAnimationWrapper>
          <ContactSection />
        </ScrollAnimationWrapper>
      </section>
      <ScrollAnimationWrapper>
        <TestimonialSlider />
      </ScrollAnimationWrapper>
      
      {/* --- ANCHOR #2: BLOG --- */}
      <section id="blog">
        <ScrollAnimationWrapper>
          <LatestArticles />
        </ScrollAnimationWrapper>
      </section>
      
     
    </>
  );
}