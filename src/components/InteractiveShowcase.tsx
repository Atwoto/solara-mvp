'use client';

import Image from 'next/image';
import Link from 'next/link';
import Tilt from 'react-parallax-tilt';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion, Variants } from 'framer-motion'; // Import Variants type

// The data remains the same
const showcaseItems = [
    {
        title: 'The Modern Home',
        image: '/images/showcase-home.jpg',
        href: '/services/residential',
        description: 'Power your home efficiently and sustainably.',
    },
    {
        title: 'The Off-Grid Adventure',
        image: '/images/showcase-van.jpg',
        href: '/products?category=portable-power-station',
        description: 'Reliable energy wherever your journey takes you.',
    },
    {
        title: 'The Smart Business',
        image: '/images/showcase-business.jpg',
        href: '/services/commercial-solar-solutions',
        description: 'Reduce costs and enhance your operations with solar.',
    },
];

// Animation variants for the section header, now explicitly typed
const headerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut'
        }
    }
};

const InteractiveShowcase = () => {
    return (
        <section className="py-20 sm:py-28 bg-cloud-white overflow-hidden">
            <div className="container px-4 mx-auto">
                <motion.div
                    className="text-center mb-14 sm:mb-20"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ staggerChildren: 0.2 }}
                >
                    <motion.h2
                        variants={headerVariants}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-graphite tracking-tight"
                    >
                        Designed for Every Lifestyle
                    </motion.h2>
                    <motion.p
                        variants={headerVariants}
                        className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto"
                    >
                        Discover how solar energy can seamlessly integrate into your world, no matter your needs.
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {showcaseItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={{
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.7,
                                        delay: index * 0.1,
                                        ease: 'easeOut'
                                    }
                                }
                            }}
                        >
                            <Link href={item.href} className="block group h-full">
                                <Tilt
                                    className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full"
                                    perspective={1000}
                                    glareEnable={true}
                                    glareMaxOpacity={0.05}
                                    glarePosition="all"
                                    scale={1.02}
                                    transitionSpeed={2000}
                                    style={{ transformStyle: 'preserve-3d' }} // Enable 3D context for children
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={item.image}
                                            alt={`Showcase image for ${item.title}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                        />
                                    </div>
                                    
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    
                                    {/* Stylized Number */}
                                    <div className="absolute top-4 right-4 text-5xl font-extrabold text-white/10" aria-hidden="true">
                                        0{index + 1}
                                    </div>

                                    {/* Floating Content Container */}
                                    <div
                                        className="absolute inset-0 p-6 flex flex-col justify-end text-white"
                                        style={{ transform: 'translateZ(50px)' }} // This makes the text "float" in 3D space
                                    >
                                        <h3 className="text-3xl font-bold text-shadow-md shadow-black/50 leading-tight transition-transform duration-500 group-hover:-translate-y-16">
                                            {item.title}
                                        </h3>
                                        
                                        {/* Description and CTA that appear on hover */}
                                        <div className="absolute bottom-6 left-6 right-6 overflow-hidden">
                                            <div className="transition-all duration-500 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                                                <p className="text-shadow-sm shadow-black/50 text-white/90">
                                                    {item.description}
                                                </p>
                                                <div className="mt-4 inline-flex items-center font-semibold bg-solar-flare-start/80 backdrop-blur-sm text-deep-night text-sm py-1.5 px-4 rounded-full">
                                                    Explore Solutions
                                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tilt>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InteractiveShowcase;