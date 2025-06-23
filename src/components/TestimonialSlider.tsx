// src/components/TestimonialSlider.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from 'next/image';
import { Testimonial as TestimonialType } from '@/types';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const TestimonialCard = ({ testimonial }: { testimonial: TestimonialType }) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between h-full w-full bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div>
        <svg className="h-12 w-12 text-solar-flare-start opacity-20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L25.864 4z" />
        </svg>
        <blockquote className="mt-4 text-lg text-gray-200 leading-relaxed">
          {testimonial.quote}
        </blockquote>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-14 w-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-solar-flare-start/50">
          <NextImage
            src={testimonial.image_url || '/images/default-avatar.png'}
            alt={testimonial.client_name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-bold text-white">{testimonial.client_name}</p>
          <p className="text-sm text-gray-400">{testimonial.client_title_company}</p>
          <div className="flex mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className={`h-4 w-4 ${i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-600'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialSlider = () => {
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false); // State to control hover pause

  useEffect(() => {
    // Data fetching logic remains the same
    const fetchTestimonials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/testimonials?limit=5');
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const data: TestimonialType[] = await response.json();
        setTestimonials(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // --- NEW: useEffect for automatic transitions ---
  useEffect(() => {
    // If the user is hovering, don't start the interval
    if (isHovered || testimonials.length <= 1) return;

    // Set up the interval to advance the slide every 5 seconds
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // 5-second interval

    // Clear the interval on component unmount or when dependencies change
    return () => clearInterval(interval);
  }, [activeIndex, isHovered, testimonials.length]); // Re-run when these change

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (isLoading || error || testimonials.length === 0) {
    // Graceful handling of loading/error/empty states
    return (
      <div className="bg-gray-900 py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">What Our Clients Say</h2>
          <p className="text-gray-400">{isLoading ? "Loading Client Stories..." : "No featured testimonials available right now."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">TESTIMONIAL</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">What Our Clients Say</h2>
        </div>
        
        {/* Main carousel container with hover-to-pause functionality */}
        <div
          className="relative h-[480px] sm:h-[400px] max-w-2xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence>
            {testimonials.map((testimonial, index) => {
              const position = index - activeIndex;
              const isVisible = Math.abs(position) < 3;
              if (!isVisible) return null;
              
              const y = position * 20;
              const scale = 1 - Math.abs(position) * 0.1;
              const opacity = 1 - Math.abs(position) * 0.3;
              const zIndex = testimonials.length - Math.abs(position);

              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity, y, scale, zIndex }}
                  exit={{ opacity: 0, y: -50, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="absolute w-full h-full cursor-pointer"
                  style={{ transformOrigin: 'bottom center' }}
                >
                  <TestimonialCard testimonial={testimonial} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons still available for user control */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <button onClick={handlePrev} className="p-3 rounded-full bg-gray-800/50 hover:bg-solar-flare-start/20 transition-colors focus:outline-none focus:ring-2 focus:ring-solar-flare-end" aria-label="Previous testimonial">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button onClick={handleNext} className="p-3 rounded-full bg-gray-800/50 hover:bg-solar-flare-start/20 transition-colors focus:outline-none focus:ring-2 focus:ring-solar-flare-end" aria-label="Next testimonial">
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;