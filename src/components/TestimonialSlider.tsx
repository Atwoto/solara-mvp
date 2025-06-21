// src/components/TestimonialSlider.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import NextImage from 'next/image';
import { Testimonial as TestimonialType } from '@/types';
import { StarIcon } from '@heroicons/react/24/solid';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// *** FIX #1: Separated variants from transitions and added 'as const' assertions. ***
const quoteVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
const quoteTransition = { duration: 0.7, ease: 'easeOut' } as const;

const authorVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};
const authorTransition = { duration: 0.5 } as const;
const authorTransitionWithDelay = { duration: 0.5, delay: 0.2 } as const;

const TestimonialSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/testimonials?limit=5');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch testimonials');
        }
        const data: TestimonialType[] = await response.json();
        setTestimonials(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching testimonials for slider:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (isLoading) return <div className="bg-deep-night text-center py-24"><p className="text-gray-300">Loading Testimonials...</p></div>;
  if (error) return <div className="bg-deep-night text-center py-24"><p className="text-red-400">Error: {error}</p></div>;
  if (testimonials.length === 0) return (
    <div className="bg-deep-night text-white py-24 text-center">
        <div className="container mx-auto px-4">
            <p className="font-semibold text-solar-flare-start mb-2 uppercase tracking-wider">Testimonial</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-16">What Our Clients Say</h2>
            <p className="text-gray-300">We value your feedback! No testimonials available yet.</p>
        </div>
    </div>
  );
  
  const currentTestimonial = testimonials[activeIndex];

  return (
    <div className="relative bg-deep-night text-white py-20 sm:py-28 overflow-hidden">
      <div className="relative container mx-auto px-4 text-center">
        <p className="font-semibold text-sm text-solar-flare-start mb-3 uppercase tracking-wider">
          Testimonial
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-12 sm:mb-16 tracking-tight">
          What Our Clients Say
        </h2>
        
        <div className="relative max-w-2xl lg:max-w-3xl mx-auto z-10">
            <div className="absolute -top-8 -left-8 text-7xl sm:text-9xl font-serif text-solar-flare-start opacity-10 transform -translate-x-1/2">
                “
            </div>
            <div className="absolute -bottom-12 -right-8 text-7xl sm:text-9xl font-serif text-solar-flare-start opacity-10 transform translate-x-1/2 rotate-180">
                “
            </div>
            
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
            pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
            loop={testimonials.length > 1}
            slidesPerView={1}
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="testimonial-swiper-custom"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.id} className="px-4 sm:px-0">
                  <motion.blockquote
                      variants={quoteVariants}
                      // *** FIX #2: Added the 'transition' prop. ***
                      transition={quoteTransition}
                      initial="hidden"
                      animate={activeIndex === index ? "visible" : "hidden"} 
                      className="text-lg sm:text-xl md:text-2xl italic leading-relaxed sm:leading-loose text-gray-200 min-h-[150px] sm:min-h-[180px] flex items-center justify-center"
                  >
                      {testimonial.quote}
                  </motion.blockquote>
              </SwiperSlide>
            ))}
            {testimonials.length > 1 && (
                <>
                    <div className="swiper-button-prev-custom absolute left-0 sm:-left-10 top-1/2 -translate-y-1/2 z-20 cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white/70 hover:text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    </div>
                    <div className="swiper-button-next-custom absolute right-0 sm:-right-10 top-1/2 -translate-y-1/2 z-20 cursor-pointer p-2 rounded-full hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white/70 hover:text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </div>
                    <div className="swiper-pagination-custom !absolute !bottom-[-30px] sm:!bottom-[-40px] w-full flex justify-center space-x-2"></div>
                </>
            )}
          </Swiper>
          
          <div className="mt-10 sm:mt-12 min-h-[120px] sm:min-h-[140px]">
            <AnimatePresence mode="wait">
              {currentTestimonial && (
                <motion.div
                  key={currentTestimonial.id}
                  variants={authorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  // *** FIX #3: Applied the correct transition objects here as well. ***
                  transition={authorTransitionWithDelay}
                  className="flex flex-col items-center"
                >
                  {currentTestimonial.image_url && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-solar-flare-start/70">
                      <NextImage 
                        src={currentTestimonial.image_url} 
                        alt={currentTestimonial.client_name} 
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <p className="text-xl sm:text-2xl font-semibold text-white">{currentTestimonial.client_name}</p>
                  {currentTestimonial.client_title_company && (
                    <p className="text-solar-flare-start text-sm sm:text-base">{currentTestimonial.client_title_company}</p>
                  )}
                  {currentTestimonial.rating && currentTestimonial.rating > 0 && (
                    <div className="flex mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon 
                          key={i} 
                          className={`h-5 w-5 ${i < currentTestimonial.rating! ? 'text-yellow-400' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .testimonial-swiper-custom .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.4) !important;
          opacity: 1;
          width: 10px;
          height: 10px;
          margin: 0 5px !important;
          transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        .testimonial-swiper-custom .swiper-pagination-bullet-active {
          background-color: #FDB813 !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default TestimonialSlider;