'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
// import NextImage from 'next/image'; // No longer needed
import { Testimonial as TestimonialType } from '@/types';
import { StarIcon } from '@heroicons/react/24/solid';

const AUTOPLAY_INTERVAL = 7000; // 7 seconds

// --- TESTIMONIAL CARD ---
const TestimonialCard = ({ testimonial }: { testimonial: TestimonialType }) => {
    return (
        <div className="flex flex-col justify-between h-full w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <svg className="absolute top-6 left-6 h-16 w-16 text-white opacity-5" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L25.864 4z" />
            </svg>
            <blockquote className="relative z-10 text-lg sm:text-xl text-gray-200 leading-relaxed font-medium">
                “{testimonial.quote}”
            </blockquote>
            <div className="relative z-10 mt-6 flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-solar-flare-start/50">
                    {/* --- THIS IS THE FIX --- */}
                    <img
                        src={testimonial.image_url || '/images/default-avatar.png'}
                        alt={testimonial.client_name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
                <div>
                    <p className="font-bold text-white">{testimonial.client_name}</p>
                    <p className="text-sm text-gray-400">{testimonial.client_title_company}</p>
                    {testimonial.rating && testimonial.rating > 0 && (
                        <div className="flex mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <StarIcon key={i} className={`h-4 w-4 ${i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-600'}`} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- TESTIMONIAL SLIDER ---
const TestimonialSlider = () => {
    const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
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

    useEffect(() => {
        if (isHovered || testimonials.length <= 1) return;
        const interval = setInterval(() => {
            setDirection(1);
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, AUTOPLAY_INTERVAL);
        return () => clearInterval(interval);
    }, [isHovered, testimonials.length]);

    const handleAvatarClick = (index: number) => {
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
    };

    const slideVariants: Variants = {
        enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1, zIndex: 1, transition: { duration: 0.5, ease: 'easeOut' } },
        exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0, zIndex: 0, transition: { duration: 0.5, ease: 'easeIn' } }),
    };

    if (isLoading || error || testimonials.length === 0) {
        return (
            <div className="bg-deep-night py-28">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">What Our Clients Say</h2>
                    <p className="text-gray-400">{isLoading ? "Loading Client Stories..." : "No featured testimonials available right now."}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative bg-deep-night text-white py-20 sm:py-28 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="absolute inset-0"
                >
                    {/* --- THIS IS THE FIX --- */}
                    <img
                        src={testimonials[activeIndex]?.image_url || '/images/default-avatar.png'}
                        alt="Client background"
                        className="absolute inset-0 object-cover w-full h-full filter blur-2xl scale-125"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-deep-night/70"></div>
                </motion.div>
            </AnimatePresence>

            <div className="relative container mx-auto px-4 z-10">
                <div className="text-center mb-16">
                    <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">TESTIMONIAL</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">What Our Clients Say</h2>
                </div>
                
                <div className="relative h-[420px] sm:h-[350px] max-w-3xl mx-auto">
                    <AnimatePresence custom={direction}>
                        <motion.div
                            key={activeIndex}
                            variants={slideVariants}
                            custom={direction}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0"
                        >
                            <TestimonialCard testimonial={testimonials[activeIndex]} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex justify-center items-end gap-3 sm:gap-4 mt-12 h-20">
                    {testimonials.map((testimonial, index) => (
                        <button
                            key={testimonial.id}
                            onClick={() => handleAvatarClick(index)}
                            className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-solar-flare-end focus-visible:ring-offset-4 focus-visible:ring-offset-deep-night"
                            aria-label={`View testimonial from ${testimonial.client_name}`}
                        >
                            <div className={`relative rounded-full overflow-hidden transition-all duration-300 ease-out ${activeIndex === index ? 'h-16 w-16' : 'h-12 w-12 opacity-50 hover:opacity-100'}`}>
                                {/* --- THIS IS THE FIX --- */}
                                <img
                                    src={testimonial.image_url || '/images/default-avatar.png'}
                                    alt={testimonial.client_name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            {activeIndex === index && (
                                <motion.svg className="absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)]" viewBox="0 0 100 100">
                                    <motion.circle
                                        key={activeIndex}
                                        cx="50"
                                        cy="50"
                                        r="48"
                                        stroke="#FDB813"
                                        strokeWidth="3"
                                        fill="transparent"
                                        initial={{ pathLength: 0 }}
                                        animate={isHovered ? { pathLength: 0 } : { pathLength: 1 }}
                                        transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
                                        style={{ rotate: -90, transformOrigin: 'center' }}
                                    />
                                </motion.svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestimonialSlider;
