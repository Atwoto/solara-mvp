'use client';

import NextImage from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { CpuChipIcon, CheckBadgeIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const commitments = [
    { icon: CheckBadgeIcon, title: "Professional Expertise", text: "Unmatched skill from certified engineers." },
    { icon: CpuChipIcon, title: "Reliable & Affordable", text: "Commitment to sustainable and accessible power." },
    { icon: UserGroupIcon, title: "Tailored Solutions", text: "Custom designs for residential and commercial clients." },
];

const StatPod = ({ value, label, suffix = '', inView }: { value: number, label: string, suffix?: string, inView: boolean }) => (
    <div className="text-center">
        <p className="text-4xl lg:text-5xl font-bold text-deep-night tracking-tighter">
            {inView ? <CountUp start={0} end={value} duration={3} separator="," /> : '0'}
            {suffix}
        </p>
        <p className="text-sm text-gray-500 uppercase tracking-wider mt-1">{label}</p>
    </div>
);

const AboutSection = () => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const sectionVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    const imageVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }, // A smoother ease for images
    };

    return (
        <section className="relative bg-cloud-white py-20 sm:py-28 overflow-hidden">
            {/* Angled background split */}
            <div className="absolute inset-0">
                <div className="absolute h-full w-full bg-white"></div>
                <div 
                    className="absolute h-full w-full bg-gray-50/70"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' }}
                ></div>
            </div>

            <div className="relative container mx-auto px-4">
                <motion.div
                    ref={ref}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-20 items-center"
                    variants={sectionVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                >
                    {/* Left Column: Text Content */}
                    <motion.div variants={itemVariants}>
                        <p className="font-semibold text-solar-flare-start mb-2 text-sm uppercase tracking-wider">
                            WHO WE ARE
                        </p>
                        <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-graphite mb-6 leading-tight">
                            Leading Kenya in <span className="bg-clip-text text-transparent bg-gradient-to-r from-solar-flare-start to-solar-flare-end">Renewable Energy</span> Expertise
                        </h2>
                        <p className="text-lg text-gray-600 max-w-none mb-10">
                            Bills On Solar EA Limited is a premier provider of top-quality solar solutions. We stand as a beacon of innovation and reliability in Kenya’s renewable energy sector.
                        </p>
                        
                        <div className="space-y-4">
                            {commitments.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-transparent hover:border-solar-flare-start/50 hover:shadow-md transition-all duration-300"
                                        custom={index}
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            visible: (i) => ({
                                                opacity: 1,
                                                x: 0,
                                                transition: { duration: 0.5, delay: i * 0.15 + 0.3, ease: 'easeOut' },
                                            }),
                                        }}
                                    >
                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-solar-flare-start/10 text-solar-flare-end mr-4">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-graphite">{item.title}</h3>
                                            <p className="text-gray-600 text-sm">{item.text}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Right Column: Image and Floating Stats */}
                    <motion.div className="relative h-[550px] lg:h-[650px]" variants={imageVariants}>
                        {/* Custom Shape Image */}
                        <div
                            className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
                            style={{ clipPath: 'polygon(20% 0, 100% 20%, 80% 100%, 0 80%)' }}
                        >
                            <NextImage
                                src="/images/about.jpg"
                                alt="Bills On Solar team working on a solar installation"
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                            />
                        </div>

                        {/* Floating Stat Pods */}
                        <motion.div
                             variants={itemVariants}
                             className="absolute -bottom-10 -left-10 w-52 h-36 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center"
                        >
                            <StatPod value={500} label="Happy Clients" suffix="+" inView={inView} />
                        </motion.div>
                        <motion.div
                            variants={itemVariants}
                            className="absolute -top-10 -right-10 w-52 h-36 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center"
                        >
                            <StatPod value={180} label="Capacity (KW)" suffix="k+" inView={inView} />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutSection;