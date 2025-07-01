'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { GlobeAltIcon, BoltIcon, SunIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Slide data now includes a CSS class for the Ken Burns animation
const slideData = [
    { image: '/images/hero-bg-1.jpg', icon: GlobeAltIcon, preTitle: 'A World Innovator in Energy', line1: 'Manageable, Reliable', line2: 'Affordable Energy!', animationClass: 'animate-kenburns-br' },
    { image: '/images/hero-bg-2.jpg', icon: SunIcon, preTitle: 'Evergreen Producer of Solar Energy', line1: 'Powering Tomorrow,', line2: 'Sustainably.', animationClass: 'animate-kenburns-tl' },
    { image: '/images/hero-bg-3.jpg', icon: BoltIcon, preTitle: 'Biggest Producer of Clean Energy', line1: 'Harnessing Power', line2: 'From the Sun.', animationClass: 'animate-kenburns-bl' },
];

// --- IMPRESSIVE WORD-BY-WORD ANIMATION COMPONENT ---
const AnimatedHeadline = ({ text, className }: { text: string, className?: string }) => {
    const words = text.split(' ');

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: i * 0.1 },
        }),
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', damping: 12, stiffness: 100 },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: { type: 'spring', damping: 12, stiffness: 100 },
        },
    };

    return (
        <motion.h1
            className={`text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight ${className}`}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    variants={child}
                    className="inline-block mr-[0.25em]" // Adjust spacing between words
                >
                    {word}
                </motion.span>
            ))}
        </motion.h1>
    );
};

const Hero = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const currentSlide = slideData[activeIndex];

    return (
        <section className="relative -mt-[108px] h-screen overflow-hidden bg-deep-night text-shadow">
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
                            <div className="absolute inset-0">
                                {/* The background image with the Ken Burns effect */}
                                <div className={`absolute inset-0 bg-cover bg-center ${slide.animationClass}`} style={{ backgroundImage: `url(${slide.image})` }}></div>
                                {/* The refined overlay */}
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.1)_0%,_rgba(0,0,0,0.6)_100%)]"></div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6 lg:px-8">
                {isClient && currentSlide && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.2 } }}
                            exit={{ opacity: 0, transition: { duration: 0.3 } }}
                            className="flex flex-col items-center max-w-4xl"
                        >
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 1, delay: 0.3 }}>
                                <currentSlide.icon className="h-12 w-12 mb-4 text-solar-flare-start" />
                            </motion.div>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                                className="mb-4 text-sm font-medium tracking-wider text-solar-flare-start uppercase sm:text-base"
                            >
                                {currentSlide.preTitle}
                            </motion.p>
                            
                            <AnimatedHeadline text={currentSlide.line1} />
                            <AnimatedHeadline text={currentSlide.line2} />

                            <motion.div
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }}
                                className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                            >
                                <Link
                                    href="/products"
                                    className="group inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-deep-night transition-all duration-300 ease-in-out transform bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-solar-flare-end focus:ring-opacity-50 active:scale-95"
                                >
                                    Explore Products <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>

                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 text-base font-semibold text-white transition-all duration-300 ease-in-out transform border-2 border-white rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 active:scale-95"
                                >
                                    Contact Us
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
            
            {/* The animated progress bar that resets on each slide change */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-sm md:max-w-md lg:max-w-lg" aria-hidden="true">
                <AnimatePresence>
                {isClient && (
                    <motion.div key={activeIndex} className="h-0.5 bg-white/20 rounded-full">
                        <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 6 }}
                            className="h-full bg-solar-flare-start rounded-full"
                        ></motion.div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Global styles for Ken Burns, Swiper, and text shadow */}
            <style jsx global>{`
                @keyframes kenburns-br {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.15) translate(-5%, -5%); }
                }
                .animate-kenburns-br { animation: kenburns-br 10s ease-out forwards; }

                @keyframes kenburns-tl {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.15) translate(5%, 5%); }
                }
                .animate-kenburns-tl { animation: kenburns-tl 10s ease-out forwards; }

                @keyframes kenburns-bl {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.15) translate(5%, -5%); }
                }
                .animate-kenburns-bl { animation: kenburns-bl 10s ease-out forwards; }
                
                .hero-swiper .swiper-button-next,
                .hero-swiper .swiper-button-prev {
                    color: #ffffff; 
                    opacity: 0.5;
                    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
                }
                .hero-swiper:hover .swiper-button-next,
                .hero-swiper:hover .swiper-button-prev {
                    opacity: 1;
                }
                .hero-swiper .swiper-button-next:hover,
                .hero-swiper .swiper-button-prev:hover {
                    transform: scale(1.1);
                }
                .hero-swiper .swiper-button-next::after,
                .hero-swiper .swiper-button-prev::after {
                    font-size: 1.75rem !important; 
                }
                .hero-swiper .swiper-pagination {
                    display: none; // We use the custom progress bar instead
                }
                .text-shadow {
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }
            `}</style>
        </section>
    );
};

export default Hero;