'use client';

import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { BoltIcon, NewspaperIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline';
import { motion, Variants } from 'framer-motion';
import { MouseEvent } from 'react';

const stats = [
    { value: 300, label: 'MW Worth of Projects', icon: BoltIcon, suffix: '+' },
    { value: 10, label: 'Latest Projects', icon: NewspaperIcon, suffix: '+' },
    { value: 18, label: 'Certifications', icon: ShieldCheckIcon, suffix: '' },
    { value: 25, label: 'Expert Staff', icon: UsersIcon, suffix: '+' },
];

// --- IMPRESSIVE NEW STAT CARD COMPONENT ---
const StatCard = ({ stat, variants }: { stat: typeof stats[0], variants: Variants }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const Icon = stat.icon;

    // This function updates CSS custom properties to move the spotlight
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--x', `${x}px`);
        e.currentTarget.style.setProperty('--y', `${y}px`);
    };

    return (
        <motion.div
            ref={ref}
            variants={variants}
            className="relative group p-6 text-center bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-solar-flare-start/50 hover:-translate-y-2"
            onMouseMove={handleMouseMove}
        >
            {/* The glowing spotlight effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{
                    background: `radial-gradient(400px circle at var(--x) var(--y), rgba(253, 184, 19, 0.15), transparent 40%)`,
                 }}
            />

            <div className="relative z-10">
                <div className="flex justify-center items-center h-16 w-16 mx-auto mb-4 rounded-full bg-solar-flare-start/10 border border-solar-flare-start/20">
                    <Icon className="h-8 w-8 text-solar-flare-start" />
                </div>
                <div className="text-5xl font-bold text-white tracking-tighter">
                    <CountUp start={0} end={inView ? stat.value : 0} duration={2.5} separator="," />
                    {stat.suffix}
                </div>
                <p className="mt-2 text-sm text-gray-400 uppercase tracking-wider">
                    {stat.label}
                </p>
            </div>
        </motion.div>
    );
};

// --- REDESIGNED STATS COUNTER SECTION ---
const StatsCounter = () => {
    const sectionVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    return (
        <section className="relative py-20 sm:py-28 bg-deep-night text-white overflow-hidden">
            {/* Animated Aurora Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="aurora-bg">
                    <div className="aurora-dot"></div>
                    <div className="aurora-dot"></div>
                    <div className="aurora-dot"></div>
                    <div className="aurora-dot"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionVariants}
                >
                    {/* Left Side: Title and Description */}
                    <motion.div className="lg:col-span-1 text-center lg:text-left" variants={itemVariants}>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                            Our Proven Track Record
                        </h2>
                        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0">
                            Decades of experience and successful projects have made us a trusted leader in solar energy.
                        </p>
                    </motion.div>

                    {/* Right Side: Stats Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        {stats.map((stat) => (
                            <StatCard key={stat.label} stat={stat} variants={itemVariants} />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* CSS for the Aurora background animation */}
            <style jsx global>{`
                .aurora-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                }
                .aurora-dot {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.7;
                }
                .aurora-dot:nth-child(1) {
                    width: 400px;
                    height: 400px;
                    background-color: rgba(253, 184, 19, 0.2); /* solar-flare-start */
                    animation: aurora-1 20s infinite alternate;
                }
                .aurora-dot:nth-child(2) {
                    width: 300px;
                    height: 300px;
                    background-color: rgba(245, 130, 32, 0.15); /* solar-flare-end */
                    animation: aurora-2 22s infinite alternate;
                }
                .aurora-dot:nth-child(3) {
                    width: 250px;
                    height: 250px;
                    background-color: rgba(255, 255, 255, 0.1);
                    animation: aurora-3 25s infinite alternate;
                }
                .aurora-dot:nth-child(4) {
                    width: 350px;
                    height: 350px;
                    background-color: rgba(253, 184, 19, 0.1);
                    animation: aurora-4 18s infinite alternate;
                }

                @keyframes aurora-1 {
                    0% { transform: translate(10vw, 20vh) scale(1); }
                    100% { transform: translate(60vw, 80vh) scale(1.2); }
                }
                @keyframes aurora-2 {
                    0% { transform: translate(80vw, 10vh) scale(1.2); }
                    100% { transform: translate(20vw, 70vh) scale(1); }
                }
                @keyframes aurora-3 {
                    0% { transform: translate(50vw, 90vh) scale(1); }
                    100% { transform: translate(10vw, 10vh) scale(1.3); }
                }
                @keyframes aurora-4 {
                    0% { transform: translate(90vw, 80vh) scale(1.3); }
                    100% { transform: translate(40vw, 5vh) scale(1); }
                }
            `}</style>
        </section>
    );
};

export default StatsCounter;