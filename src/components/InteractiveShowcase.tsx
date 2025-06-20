// src/components/InteractiveShowcase.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link'; // Import Link
import Tilt from 'react-parallax-tilt'; // You're using this for a nice effect

const showcaseItems = [
  {
    title: 'The Modern Home',
    image: '/images/showcase-home.jpg',
    href: '/products?category=residential', // Example link to a filtered product page
    description: 'Power your home efficiently and sustainably.',
  },
  {
    title: 'The Off-Grid Adventure',
    image: '/images/showcase-van.jpg',
    href: '/products?category=portable', // Example link
    description: 'Reliable energy wherever your journey takes you.',
  },
  {
    title: 'The Smart Business',
    image: '/images/showcase-business.jpg',
    href: '/products?category=commercial', // Example link
    description: 'Reduce costs and enhance your operations with solar.',
  },
];

const InteractiveShowcase = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50"> {/* Changed to bg-gray-50 for a very light bg */}
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-graphite tracking-tight">
            Designed for Every Lifestyle
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how solar energy can seamlessly integrate into your world, no matter your needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {showcaseItems.map((item) => (
            <Link key={item.title} href={item.href} passHref legacyBehavior>
              <a className="block group"> {/* Make the entire card a link and a group for hover effects */}
                <Tilt
                  className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col" // Ensure tilt takes full height and is flex
                  perspective={800} // Adjusted perspective
                  glareEnable={true}
                  glareMaxOpacity={0.15} // Reduced glare opacity
                  glarePosition="all"
                  scale={1.03} // Subtle scale from Tilt
                  transitionSpeed={1000}
                >
                  <div className="relative h-72 sm:h-80 md:h-96 w-full"> {/* Fixed height for image container */}
                    <Image
                      src={item.image}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 ease-in-out group-hover:scale-110" // Keep your image scale on group hover
                    />
                    {/* Darker overlay and gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl sm:text-3xl font-semibold text-shadow-md leading-tight"> 
                        {/* Added text-shadow utility class (define in global CSS or style jsx) */}
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-2 text-sm opacity-90 text-shadow-sm line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Tilt>
              </a>
            </Link>
          ))}
        </div>
      </div>
      {/* If you don't have text-shadow utilities in Tailwind, add this: */}
      <style jsx global>{`
        .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
        .text-shadow-md { text-shadow: 0 2px 4px rgba(0,0,0,0.4); }
      `}</style>
    </section>
  );
};

export default InteractiveShowcase;