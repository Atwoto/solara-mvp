// src/components/ScrollProgress.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      
      if (scrollPosition > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setProgress((scrollPosition / totalHeight) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        // **THE FIX IS HERE:** Changed bottom-5 left-5 to bottom-24 right-5
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#FF8008 ${progress}%, #e0e0e0 ${progress}%)`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          {/* Inner circle */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <span className="text-sm font-bold text-deep-night">{Math.round(progress)}%</span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollProgress;