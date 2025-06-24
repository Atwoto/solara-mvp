// src/components/ScrollProgress.tsx
'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  // This is the modern, performant way to react to scroll changes.
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Show button after scrolling past 10% of the page
    if (latest > 0.1) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  // --- THE "WOW" UPGRADES ---
  // 1. Create a motion value that maps scroll (0-1) to percentage (0-100)
  const progressPercentage = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  // 2. Create a motion value for the background using the percentage. This animates smoothly.
  const background = useTransform(
    progressPercentage,
    (p) => `conic-gradient(#FF8008 ${p}%, #e0e0e0 ${p}%)`
  );

  // 3. Create a rounded motion value for the text display so it counts up smoothly.
  const roundedPercentage = useTransform(progressPercentage, (latest) => Math.round(latest));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          // THE FIX: Correctly positioned above the chatbot.
          className="fixed bottom-28 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
          style={{ background }} // Use the smooth, transformed background
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 300 } }}
          whileTap={{ scale: 0.95 }}
          aria-label="Scroll to top"
        >
          {/* Inner circle */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
            {/* This motion.span will display the animated number */}
            <motion.span className="text-sm font-bold text-deep-night">
              {roundedPercentage}
            </motion.span>
            <span className="text-sm font-bold text-deep-night">%</span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollProgress;