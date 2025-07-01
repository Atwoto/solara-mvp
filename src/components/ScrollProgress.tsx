'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/solid';

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    // This hook determines when the button should appear.
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setIsVisible(latest > 0.1);
    });

    // --- IMPRESSIVE UI/UX UPGRADES ---

    // 1. Transform scroll progress (0-1) into a percentage (0-100) for display.
    const progressPercentage = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const roundedPercentage = useTransform(progressPercentage, (latest) => Math.round(latest));

    // 2. Create a smooth conic-gradient background for the progress ring.
    const background = useTransform(
        progressPercentage,
        (p) => `conic-gradient(from 180deg at 50% 50%, #F58220 0%, #FDB813 ${p}%, rgb(255 255 255 / 0.1) ${p}%)`
    );

    // 3. Animate the arrow icon's rotation and opacity based on scroll progress.
    const arrowRotation = useTransform(scrollYProgress, [0.9, 1], [-45, 0]);
    const arrowOpacity = useTransform(scrollYProgress, [0.9, 1], [0.5, 1]);
    const percentageOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    onClick={scrollToTop}
                    className="fixed bottom-28 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-lg backdrop-blur-md"
                    style={{ background }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 300 } }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Scroll to top"
                >
                    {/* Inner circle with a clean background */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80">
                        {/* Container for the animated content */}
                        <div className="relative h-6 w-6 flex items-center justify-center">
                            {/* Animated Arrow Icon */}
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ rotate: arrowRotation, opacity: arrowOpacity }}
                            >
                                <ArrowUpIcon className="h-6 w-6 text-deep-night" />
                            </motion.div>

                            {/* Animated Percentage Text */}
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ opacity: percentageOpacity }}
                            >
                                <motion.span className="text-sm font-bold text-deep-night">
                                    {roundedPercentage}
                                </motion.span>
                                <span className="text-sm font-bold text-deep-night">%</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollProgress;