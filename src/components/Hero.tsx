// src/components/Hero.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { GlobeAltIcon, BoltIcon, SunIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slideData = [
  { image: '/images/hero-bg-1.jpg', icon: GlobeAltIcon, preTitle: 'A World Innovator in Energy', line1: 'Manageable, Reliable', line2: 'and Affordable Energy!' },
  { image: '/images/hero-bg-2.jpg', icon: SunIcon, preTitle: 'Evergreen Producer of Solar Energy', line1: 'Powering Your Tomorrow,', line2: 'Sustainably' },
  { image: '/images/hero-bg-3.jpg', icon: BoltIcon, preTitle: 'Biggest Producer of Clean Energy', line1: 'Harnessing the Power', line2: 'of the Sun' },
];

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const textItemVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    // --- FIX: Changed from <main> to <section> ---
    // Removed h-screen and added a negative top margin to pull it "up" into the layout's padding area.
    <section className="relative -mt-[60px] h-screen overflow-hidden bg-deep-night text-shadow-sm">
      {isClient && (
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          spaceBetween={0}
          centeredSlides={true}
          loop={true}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          effect={'fade'}
          navigation={true}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="h-full w-full hero-swiper"
        >
          {slideData.map((slide, index) => (
            <SwiperSlide key={index}>
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-60"></div> 
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6 lg:px-8">
        {isClient && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex} 
              variants={textContainerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center max-w-3xl"
            >
              <motion.div variants={textItemVariants}>
                {(() => {
                  const currentSlide = slideData[activeIndex];
                  if (!currentSlide) return null;
                  const Icon = currentSlide.icon;
                  return <Icon className="h-10 w-10 mb-3 text-solar-flare-start" />; 
                })()}
              </motion.div>
              <motion.p 
                className="mb-3 text-sm font-medium tracking-wider text-solar-flare-start uppercase sm:text-base" 
                variants={textItemVariants}
              >
                {slideData[activeIndex]?.preTitle}
              </motion.p>
              <motion.h1 
                className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
                variants={textItemVariants}
              >
                {slideData[activeIndex]?.line1}
              </motion.h1>
              <motion.h1 
                className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
                variants={textItemVariants}
              >
                {slideData[activeIndex]?.line2}
              </motion.h1>
              <motion.div variants={textItemVariants} className="mt-10 sm:mt-12">
                <Link href="/products" legacyBehavior>
                  <a className="inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold text-white transition-all duration-300 ease-in-out transform bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-solar-flare-end focus:ring-opacity-50 active:scale-95">
                    GET STARTED
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        {!isClient && (
          <div className="flex flex-col items-center max-w-3xl opacity-0" aria-hidden="true"> 
            <div className="h-10 w-10 mb-3"></div>
            <p className="mb-3 text-sm font-medium tracking-wider uppercase sm:text-base"> </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight"> </h1>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight"> </h1>
            <div className="mt-10 sm:mt-12">
              <div className="inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold rounded-lg">
                 
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom styles for Swiper navigation and pagination */}
      <style jsx global>{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: #ffffff; 
          opacity: 0.5;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
          transform: translateY(-50%); 
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
        }
        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 1.75rem !important; 
        }
        
        .hero-swiper .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.6);
          width: 10px;
          height: 10px;
          opacity: 1;
          transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background-color: #FDB813; /* solar-flare-start */
          transform: scale(1.2);
        }
        .text-shadow-sm {
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      `}</style>
    </section> 
  );
};

export default Hero;