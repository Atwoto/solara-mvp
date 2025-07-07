'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { ShieldCheckIcon, WrenchScrewdriverIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const features = [
    {
        name: 'Quality Products',
        description: 'We source only the highest-grade solar panels and components from world-renowned brands to ensure longevity and maximum efficiency for your investment.',
        icon: ShieldCheckIcon,
        imageUrl: '/images/test.jpg',
    },
    {
        name: 'Expert Installation',
        description: 'Our certified technicians ensure a seamless, safe, and efficient installation process, customized precisely for your property needs and compliant with all regulations.',
        icon: WrenchScrewdriverIcon,
        imageUrl: '/images/test2.jpg',
    },
    {
        name: 'Dedicated Support',
        description: 'From your initial consultation to our comprehensive after-sales service and warranties, our dedicated team is here to support you every step of the way.',
        icon: ChatBubbleBottomCenterTextIcon,
        imageUrl: '/images/test4.jpg',
    },
];

const AUTOPLAY_INTERVAL = 7000; // 7 seconds

// --- IMPRESSIVE NEW FEATURE CARD COMPONENT ---
const FeatureCard = ({ feature, isActive, onClick }: { feature: typeof features[0], isActive: boolean, onClick: () => void }) => {
    const Icon = feature.icon;
    return (
        <button
            onClick={onClick}
            className="relative w-full text-left p-6 rounded-2xl transition-all duration-300 ease-in-out"
        >
            {/* Background Glow for active card */}
            {isActive && (
                <motion.div
                    layoutId="active-feature-background"
                    className="absolute inset-0 bg-gray-800/60 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
            <div className="relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-lg transition-colors duration-300 ${isActive ? 'bg-solar-flare-start/10' : 'bg-gray-700/50'}`}>
                        <Icon className={`h-7 w-7 transition-colors duration-300 ${isActive ? 'text-solar-flare-end' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                        <p className="text-sm text-gray-400 mt-1 hidden sm:block">Click to learn more</p>
                    </div>
                </div>
            </div>
            {/* Animated Progress Bar for active card */}
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 px-4" aria-hidden="true">
                    <motion.div
                        key={feature.name} // Re-trigger animation on change
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
                        className="h-full bg-solar-flare-end rounded-full"
                    />
                </div>
            )}
        </button>
    );
};

// --- REDESIGNED WHY CHOOSE US SECTION ---
const WhyChooseUs = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const selectedFeature = features[selectedIndex];

    // Auto-play logic
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setSelectedIndex((prevIndex) => (prevIndex + 1) % features.length);
        }, AUTOPLAY_INTERVAL);

        return () => clearInterval(interval);
    }, [isHovered]);

    const sectionVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    return (
        <div 
            className="relative bg-deep-night text-white py-20 sm:py-28 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
             {/* Animated Aurora Background */}
             <div className="absolute inset-0 z-0 opacity-30">
                <div className="aurora-bg">
                    <div className="aurora-dot"></div>
                    <div className="aurora-dot"></div>
                </div>
            </div>

            <div className="relative container mx-auto px-4 z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionVariants}
                >
                    <motion.div variants={itemVariants} className="mx-auto max-w-3xl text-center mb-16">
                        <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">
                            THE BILLS ON SOLAR ADVANTAGE
                        </p>
                        <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                            Why We Are The Right Choice
                        </h2>
                        <p className="mt-4 text-lg text-gray-300">
                            We are committed to providing exceptional solar solutions, backed by quality, expertise, and unwavering support.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={feature.name}
                                feature={feature}
                                isActive={selectedIndex === index}
                                onClick={() => setSelectedIndex(index)}
                            />
                        ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-gray-900/30 backdrop-blur-sm border border-white/10 p-8 rounded-3xl min-h-[450px]">
                        {/* Left Column: Animated Image with Cinematic Reveal */}
                        <div className="relative h-64 lg:h-full w-full rounded-2xl overflow-hidden">
                            <AnimatePresence>
                                <motion.div
                                    key={selectedFeature.imageUrl}
                                    initial={{ clipPath: 'circle(0% at 50% 50%)' }}
                                    animate={{ clipPath: 'circle(75% at 50% 50%)' }}
                                    exit={{ clipPath: 'circle(0% at 50% 50%)' }}
                                    transition={{ duration: 0.7, ease: [0.45, 0, 0.55, 1] }}
                                    className="absolute inset-0"
                                >
                                    <NextImage
                                        src={selectedFeature.imageUrl}
                                        alt={selectedFeature.name}
                                        layout="fill"
                                        objectFit="cover"
                                        className="w-full h-full"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {/* Right Column: Animated Description Text */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedFeature.name}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                >
                                    <h3 className="text-2xl font-bold text-white mb-4">{selectedFeature.name}</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {selectedFeature.description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
             {/* Reusing Aurora styles from previous component */}
             <style jsx global>{`
                .aurora-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; }
                .aurora-dot { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.7; }
                .aurora-dot:nth-child(1) { width: 500px; height: 500px; background-color: rgba(253, 184, 19, 0.1); animation: aurora-1 20s infinite alternate; }
                .aurora-dot:nth-child(2) { width: 400px; height: 400px; background-color: rgba(245, 130, 32, 0.1); animation: aurora-2 22s infinite alternate; }
                @keyframes aurora-1 { 0% { transform: translate(10vw, 20vh); } 100% { transform: translate(70vw, 80vh); } }
                @keyframes aurora-2 { 0% { transform: translate(80vw, 10vh); } 100% { transform: translate(30vw, 90vh); } }
            `}</style>
        </div>
    );
};

export default WhyChooseUs;