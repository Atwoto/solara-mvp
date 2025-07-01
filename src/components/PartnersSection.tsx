'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { MouseEvent } from 'react';

const technologyPartners = [
    { name: 'GoodWe', logoUrl: '/images/logos/goodwe.png', website: 'https://www.goodwe.com/' },
    { name: 'Huawei', logoUrl: '/images/logos/huawei.png', website: 'https://solar.huawei.com/' },
    { name: 'Hinen', logoUrl: '/images/logos/hinen.png', website: 'https://www.hinen.com/' },
    { name: 'Solis', logoUrl: '/images/logos/solis.png', website: 'https://www.solisinverters.com/' },
    { name: 'Victron Energy', logoUrl: '/images/logos/victron.png', website: 'https://www.victronenergy.com/' },
    { name: 'Fronius', logoUrl: '/images/logos/fronius.png', website: 'https://www.fronius.com/en/solar-energy' },
    { name: 'Ritar', logoUrl: '/images/logos/ritar.png', website: 'http://www.ritarpower.com/' },
];

const organizations = [
    { name: 'EPRA Kenya', logoUrl: '/images/logos/epra.png', website: 'https://www.epra.go.ke/' },
    { name: 'REREC', logoUrl: '/images/logos/rerec.png', website: 'https://www.rerec.co.ke/' },
    { name: 'Médecins Sans Frontières', logoUrl: '/images/logos/msf.png', website: 'https://www.msf.org/' },
    { name: 'Kenya Red Cross', logoUrl: '/images/logos/redcross.png', website: 'https://www.redcross.or.ke/' },
];

// --- IMPRESSIVE NEW LOGO SCROLLER ---
const LogoScroller = ({ logos, reverse = false }: { logos: { name: string; logoUrl: string; website: string }[]; reverse?: boolean }) => {
    const extendedLogos = [...logos, ...logos, ...logos]; // Duplicating more times for a smoother, longer scroll

    return (
        <div
            className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_48px,_black_calc(100%-48px),transparent_100%)]"
        >
            <ul className={`flex items-center justify-start [&_li]:mx-6 hover:[animation-play-state:paused] ${reverse ? 'animate-infinite-scroll-reverse' : 'animate-infinite-scroll'}`}>
                {extendedLogos.map((logo, index) => (
                    <li key={`${logo.name}-${index}`}>
                        <Link href={logo.website} target="_blank" rel="noopener noreferrer" className="group block">
                            <div className="relative h-20 w-36 transition-transform duration-300 ease-in-out group-hover:scale-110">
                                <NextImage
                                    src={logo.logoUrl}
                                    alt={`${logo.name} Logo`}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                                    sizes="144px"
                                />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- REDESIGNED PARTNERS SECTION ---
const PartnersSection = () => {
    
    // This function updates CSS custom properties for the spotlight effect on the main card
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--x', `${x}px`);
        e.currentTarget.style.setProperty('--y', `${y}px`);
    };

    const sectionVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
    };

    return (
        <div className="bg-cloud-white py-20 sm:py-28">
            <div className="container mx-auto px-4">
                <motion.div
                    className="relative p-8 sm:p-12 bg-gray-900/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    onMouseMove={handleMouseMove}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionVariants}
                >
                    {/* Interactive Spotlight Effect */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
                         style={{
                            background: `radial-gradient(600px circle at var(--x) var(--y), rgba(253, 184, 19, 0.1), transparent 40%)`,
                         }}
                    />

                    <div className="relative z-10">
                        <motion.div variants={itemVariants} className="text-center mb-16">
                            <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">
                                TRUSTED BY THE BEST
                            </p>
                            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-graphite">
                                Our Partners & Collaborators
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                We are proud to work with leading technology brands and esteemed organizations to deliver top-tier solar solutions across Kenya.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-12">
                            <div>
                                <h3 className="text-xl font-semibold text-center text-gray-700 mb-8 tracking-wide">
                                    Our Technology Partners
                                </h3>
                                <LogoScroller logos={technologyPartners} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-center text-gray-700 mb-8 tracking-wide">
                                    Organizations We Collaborate With
                                </h3>
                                <LogoScroller logos={organizations} reverse={true} />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PartnersSection;