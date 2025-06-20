// src/components/AboutSection.tsx
'use client';

import NextImage from 'next/image';
import Link from 'next/link'; // Import Link for a potential CTA
import { CpuChipIcon, CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Added ArrowRightIcon for CTA

const AboutSection = () => {
  return (
    <div className="bg-white py-16 sm:py-24"> {/* Consistent padding */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center"> {/* Slightly reduced gap */}
          
          {/* Left Column: Image with Stats */}
          <div className="relative h-[450px] sm:h-[500px] md:h-[550px] rounded-xl overflow-hidden shadow-2xl group"> {/* Added rounded-xl, shadow, group */}
            <NextImage
              src="/images/about-us.jpg" // Replace with your actual high-quality image
              alt="Bills On Solar team working on a solar installation project"
              layout="fill"
              objectFit="cover"
              className="transform transition-transform duration-500 ease-in-out group-hover:scale-105" // Subtle zoom on hover
            />
            {/* Darker gradient for better text visibility on stats */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-4"> {/* Stack on small, row on sm+ */}
                <div className="bg-green-600/90 backdrop-blur-sm text-white p-4 sm:p-6 rounded-lg flex-1 flex flex-col items-center text-center shadow-md"> {/* Added backdrop-blur, centered items */}
                  <CpuChipIcon className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-green-200" />
                  <p className="text-3xl sm:text-4xl font-bold">180k+</p>
                  <p className="text-sm sm:text-base">Installed Capacity (W)</p>
                </div>
                <div className="bg-solar-flare-end/90 backdrop-blur-sm text-white p-4 sm:p-6 rounded-lg flex-1 flex flex-col items-center text-center shadow-md">
                  <CheckBadgeIcon className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-orange-200" />
                  <p className="text-3xl sm:text-4xl font-bold">500+</p>
                  <p className="text-sm sm:text-base">Projects Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="py-6 lg:py-0"> {/* Added padding for text on mobile if image takes full width */}
            <p className="font-semibold text-solar-flare-start mb-2 text-sm uppercase tracking-wider">
              ABOUT US
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-extrabold text-graphite mb-6 leading-tight"> {/* Increased font-extrabold, leading-tight */}
              Best Solar Solutions and Renewable Energy Expertise
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none"> {/* Used Tailwind Typography for text styling */}
              <p>
                With over a decade of experience providing top-quality solar solutions across Kenya, Bills On Solar EA Limited stands as a leader in the renewable energy sector.
              </p>
              <p>
                Our dedicated team of professionally trained and certified engineers and technicians is committed to delivering reliable, affordable, and sustainable power. We cater to a diverse clientele, from residential homes seeking energy independence to large commercial enterprises aiming to optimize operational costs.
              </p>
            </div>
            {/* Optional Call to Action Button */}
            <div className="mt-8">
              <Link href="/about" legacyBehavior>
                <a className="inline-flex items-center justify-center px-7 py-3 text-base font-medium text-white transition-all duration-300 ease-in-out transform bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-solar-flare-end focus:ring-opacity-50 active:scale-95">
                  Learn More About Us
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;