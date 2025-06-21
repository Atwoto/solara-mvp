// src/components/ScrollToTopButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up a listener for scrolling
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 right-5 z-[9990] h-12 w-12 rounded-full bg-deep-night/70 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-deep-night hover:scale-110 focus:outline-none focus:ring-2 focus:ring-solar-flare-start focus:ring-offset-2 focus:ring-offset-gray-50"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="h-6 w-6 mx-auto" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;