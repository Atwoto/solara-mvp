// src/components/WhyChooseUs.tsx
'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { ShieldCheckIcon, WrenchScrewdriverIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    name: 'Quality Products',
    description: 'We source only the highest-grade solar panels and components from world-renowned brands to ensure longevity and maximum efficiency for your investment.',
    icon: ShieldCheckIcon,
    imageUrl: '/images/why-us-quality.jpg',
  },
  {
    name: 'Expert Installation',
    description: 'Our certified technicians ensure a seamless, safe, and efficient installation process, customized precisely for your property needs and compliant with all regulations.',
    icon: WrenchScrewdriverIcon,
    imageUrl: '/images/why-us-installation.jpg',
  },
  {
    name: 'Dedicated Support',
    description: 'From your initial consultation to our comprehensive after-sales service and warranties, our dedicated team is here to support you every step of the way.',
    icon: ChatBubbleBottomCenterTextIcon,
    imageUrl: '/images/why-us-support.jpg',
  },
];

const WhyChooseUs = () => {
  // State to track the currently selected feature
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

  return (
    <div className="bg-deep-night text-white py-20 sm:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl lg:text-center mb-16"
        >
          <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">
            THE BILLS ON SOLAR ADVANTAGE
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Why We Are The Right Choice
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            We are committed to providing exceptional solar solutions, backed by quality, expertise, and unwavering support.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Feature Selector & Description */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="space-y-4">
              {features.map((feature) => (
                <button
                  key={feature.name}
                  onClick={() => setSelectedFeature(feature)}
                  className={`relative w-full text-left p-5 rounded-lg transition-colors duration-300 ${
                    selectedFeature.name === feature.name ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'
                  }`}
                >
                  {/* The "Magic Motion" highlight div */}
                  {selectedFeature.name === feature.name && (
                    <motion.div
                      layoutId="active-highlight"
                      className="absolute inset-0 bg-gradient-to-r from-solar-flare-start/10 to-solar-flare-end/10 border-l-4 border-solar-flare-end rounded-lg"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <feature.icon className={`h-8 w-8 transition-colors duration-300 ${selectedFeature.name === feature.name ? 'text-solar-flare-end' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                  </div>
                </button>
              ))}
            </div>

            {/* Animated Description Text */}
            <div className="mt-8 min-h-[100px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={selectedFeature.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="text-gray-300 leading-relaxed"
                >
                  {selectedFeature.description}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Animated Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative h-[450px] rounded-xl overflow-hidden shadow-2xl"
          >
            <AnimatePresence>
              <motion.div
                key={selectedFeature.imageUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;