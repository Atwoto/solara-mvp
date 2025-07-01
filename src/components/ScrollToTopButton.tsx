'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/solid';

const ScrollToTopButton = () => {
    const { scrollYProgress } = useScroll();
    const [isVisible, setIsVisible] = useState(false);

    // This is the modern, performant way to react to scroll changes.
    // It shows the button only after the user has scrolled 25% of the page.
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setIsVisible(latest > 0.25);
    });

    // --- IMPRESSIVE UI/UX UPGRADES ---

    // 1. Transform scroll progress (0-1) into a path length for the SVG circle.
    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

    // 2. Create a subtle opacity transition for the arrow.
    const arrowOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    onClick={scrollToTop}
                    className="fixed bottom-20 left-5 z-[9990] flex h-14 w-14 items-center justify-center rounded-full bg-deep-night/50 text-white shadow-lg backdrop-blur-md transition-colors duration-300 hover:bg-deep-night focus:outline-none focus-visible:ring-2 focus-visible:ring-solar-flare-start focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 300 } }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Scroll to top"
                >
                    {/* SVG for the circular progress ring */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                        {/* Background of the ring */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="4"
                            fill="transparent"
                        />
                        {/* The animated progress part of the ring */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="url(#progress-gradient)"
                            strokeWidth="4"
                            fill="transparent"
                            strokeLinecap="round"
                            style={{
                                pathLength,
                                rotate: -90,
                                transformOrigin: 'center',
                            }}
                        />
                        {/* Defining the gradient for the progress ring */}
                        <defs>
                            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FDB813" />
                                <stop offset="100%" stopColor="#F58220" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* The arrow icon that fades in */}
                    <motion.div style={{ opacity: arrowOpacity }}>
                        <ArrowUpIcon className="h-6 w-6" />
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTopButton;