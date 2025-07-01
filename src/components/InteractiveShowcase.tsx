'use client';

import Image from 'next/image';
import Link from 'next/link';
import Tilt from 'react-parallax-tilt';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

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

const InteractiveShowcase = () => {
  return (
    // Using our new branded background color for consistency
    <section className="py-16 sm:py-24 bg-cloud-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-graphite tracking-tight">
            Designed for Every Lifestyle
          </h2>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Discover how solar energy can seamlessly integrate into your world, no matter your needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {showcaseItems.map((item) => (
            // Modern Next.js Link syntax - no legacyBehavior or <a> tag needed
            <Link key={item.title} href={item.href} className="block group">
              <Tilt
                className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full"
                perspective={1000}
                glareEnable={true}
                glareMaxOpacity={0.1}
                glarePosition="all"
                scale={1.02}
                transitionSpeed={1500}
              >
                <div className="relative h-96 w-full">
                  <Image
                    src={item.image}
                    alt={`Showcase image for ${item.title}`}
                    fill // Use fill to cover the container
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Fixes performance warning
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                  
                  {/* Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
                  
                  {/* Animated content container */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white transform-gpu transition-transform duration-500 ease-in-out group-hover:-translate-y-4">
                    <h3 className="text-3xl font-bold text-shadow-md shadow-black/50 leading-tight">
                      {item.title}
                    </h3>
                    
                    {/* Description and CTA that appear on hover */}
                    <div className="mt-2 overflow-hidden transition-all duration-500 ease-in-out opacity-0 max-h-0 group-hover:max-h-40 group-hover:opacity-100">
                      <p className="text-shadow-sm shadow-black/50">
                        {item.description}
                      </p>
                      <p className="mt-4 flex items-center font-semibold text-solar-flare-start text-shadow-sm shadow-black/50">
                        Explore Solutions
                        <ArrowRightIcon className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </p>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveShowcase;