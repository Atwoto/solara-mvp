// src/components/AboutSection.tsx
'use client';

import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { CpuChipIcon, CheckBadgeIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const AboutSection = () => {
  // This hook will trigger the number animation when the element is in view
  const { ref, inView } = useInView({
    triggerOnce: true, // Animate only once
    threshold: 0.3,    // Trigger when 30% of the element is visible
  });

  const commitments = [
    { text: "Unmatched professional expertise from certified engineers." },
    { text: "Commitment to reliable, affordable, and sustainable power." },
    { text: "Tailored solutions for residential and commercial clients." },
  ];

  return (
    // Added a subtle background pattern for texture
    <div className="relative bg-white py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/patterns/subtle-grid.svg')] opacity-30"></div>
      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Image with Animated Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative h-[500px] md:h-[580px] rounded-xl overflow-hidden shadow-2xl group"
          >
            <NextImage
              src="/images/about-us.jpg"
              alt="Bills On Solar team working on a solar installation"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
            
            <div ref={ref} className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* --- STAT #1 WITH COUNTUP --- */}
                <div className="bg-green-600/90 backdrop-blur-sm text-white p-6 rounded-lg flex-1 flex flex-col items-center text-center shadow-lg">
                  <UserGroupIcon className="h-10 w-10 mb-2 text-green-200" />
                  <p className="text-4xl font-bold">
                    {inView ? <CountUp start={0} end={500} duration={2.5} suffix="+" /> : '0+'}
                  </p>
                  <p className="text-base">Happy Clients</p>
                </div>
                {/* --- STAT #2 WITH COUNTUP --- */}
                <div className="bg-solar-flare-end/90 backdrop-blur-sm text-white p-6 rounded-lg flex-1 flex flex-col items-center text-center shadow-lg">
                  <CpuChipIcon className="h-10 w-10 mb-2 text-orange-200" />
                  <p className="text-4xl font-bold">
                    {inView ? <CountUp start={0} end={180} duration={2.5} suffix="k+" /> : '0k+'}
                  </p>
                  <p className="text-base">Installed Capacity (KW)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Animated Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            <p className="font-semibold text-solar-flare-start mb-2 text-sm uppercase tracking-wider">
              WHO WE ARE
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-graphite mb-6 leading-tight">
              Leading Kenya in <span className="bg-clip-text text-transparent bg-gradient-to-r from-solar-flare-start to-solar-flare-end">Renewable Energy</span> Expertise
            </h2>
            <p className="text-lg text-gray-600 max-w-none">
              Bills On Solar EA Limited is a premier provider of top-quality solar solutions. We stand as a beacon of innovation and reliability in Kenya’s renewable energy sector.
            </p>
            
            {/* New "Our Commitment" section */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-graphite mb-4">Our Commitment</h3>
                <ul className="space-y-3">
                    {commitments.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <CheckBadgeIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{item.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;