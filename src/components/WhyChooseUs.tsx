// src/components/WhyChooseUs.tsx
'use client';

import NextImage from 'next/image';
import { ShieldCheckIcon, WrenchScrewdriverIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Quality Products',
    description: 'We source only the highest-grade solar panels and components to ensure longevity and maximum efficiency for your investment.',
    icon: ShieldCheckIcon,
    imageUrl: '/images/why-us-quality.jpg',
  },
  {
    name: 'Expert Installation',
    description: 'Our certified technicians ensure a seamless, safe, and efficient installation process, customized precisely for your property needs.',
    icon: WrenchScrewdriverIcon,
    imageUrl: '/images/why-us-installation.jpg',
  },
  {
    name: 'Dedicated Support',
    description: 'From initial consultation to comprehensive after-sales service, our dedicated team is here to support you every step of the way.',
    icon: ChatBubbleBottomCenterTextIcon,
    imageUrl: '/images/why-us-support.jpg',
  },
];

const WhyChooseUs = () => {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl lg:text-center mb-12 sm:mb-16">
          <p className="font-semibold text-sm text-solar-flare-start uppercase tracking-wider">
            FEW REASONS TO CHOOSE US
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-graphite">
            Why Bills On Solar is the Right Choice
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We are committed to providing you with exceptional solar solutions, backed by quality, expertise, and unwavering support.
          </p>
        </div>
        
        <div className="mx-auto grid max-w-md grid-cols-1 gap-8 md:max-w-3xl lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div 
              key={feature.name} 
              className="group relative flex flex-col overflow-hidden rounded-xl bg-white p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              {/* Background Image - hidden by default, appears on group-hover */}
              <NextImage
                src={feature.imageUrl}
                alt="" 
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                aria-hidden="true"
              />
              {/* Dark Overlay - also appears on group-hover, controls overall darkness */}
              <div className="absolute inset-0 z-10 bg-black opacity-0 group-hover:opacity-60 transition-opacity duration-500 ease-in-out"></div>
              
              {/* Content - sits on top */}
              <div className="relative z-20 flex flex-col flex-grow">
                <div className="mb-6">
                  {/* Icon background changes color on group hover to maintain visibility */}
                  <span 
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-solar-flare-start to-solar-flare-end 
                               group-hover:bg-white/90 transition-colors duration-300 ease-in-out shadow-md"
                  >
                    {/* Icon color also changes on group hover */}
                    <feature.icon 
                      className="h-7 w-7 text-white group-hover:text-solar-flare-end transition-colors duration-300 ease-in-out" 
                      aria-hidden="true" 
                    />
                  </span>
                </div>
                {/* Text color changes to white on group hover for contrast against dark overlay */}
                <h3 className="text-xl font-semibold text-graphite mb-3 group-hover:text-white transition-colors duration-300 ease-in-out text-shadow-sm-hover">
                  {feature.name}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed flex-grow group-hover:text-gray-100 transition-colors duration-300 ease-in-out text-shadow-sm-hover">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Add text-shadow utility for hover state if not globally defined */}
      <style jsx global>{`
        .text-shadow-sm-hover:hover, .group:hover .text-shadow-sm-hover { 
            text-shadow: 0 1px 3px rgba(0,0,0,0.7); /* Stronger shadow on hover for white text on dark bg */
        } 
      `}</style>
    </div>
  );
};

export default WhyChooseUs;