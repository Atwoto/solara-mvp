'use client';

import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// Reusable sub-component with enhanced styling
const ContactInfo = ({ icon, text, href }: { icon: React.ReactNode; text: string; href: string }) => (
  <a
    href={href}
    // The 'group' class allows us to style child elements on parent hover
    className="group flex items-center text-sm text-gray-400 hover:text-white transition-all duration-300"
  >
    <span className="text-solar-flare-start transition-transform duration-300 group-hover:scale-110">
      {icon}
    </span>
    <span className="ml-3 tracking-wide">{text}</span>
  </a>
);

// Main TopBar component
export const TopBar = () => {
  const contactItems = [
    { 
      icon: <MapPinIcon className="h-4 w-4" />, 
      text: "Ashray industrial park, Off Enterprise Road", 
      href: "https://maps.google.com/?q=Ashray+industrial+park" 
    },
    { 
      icon: <EnvelopeIcon className="h-4 w-4" />, 
      text: "info@billsonsolar.co.ke", 
      href: "mailto:info@billsonsolar.co.ke" 
    },
    { 
      icon: <PhoneIcon className="h-4 w-4" />, 
      text: "+254 702 156 134", 
      href: "tel:+254702156134" 
    },
  ];

  return (
    <>
      {/* This style block contains the CSS keyframe animation for the marquee effect.
        Placing it here keeps the animation logic encapsulated with the component.
      */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="bg-graphite text-white w-full border-b border-white/10 z-50 relative"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          
          {/* --- Mobile-only Contact Info --- */}
          <div className="flex md:hidden">
            <ContactInfo
              icon={<PhoneIcon className="h-4 w-4" />}
              text="+254 702 156 134"
              href="tel:+254702156134"
            />
          </div>

          {/* --- Desktop Marquee --- */}
          {/* This container is only visible on medium screens and up */}
          <div className="hidden md:flex flex-1 items-center overflow-hidden">
            <div className="flex-shrink-0 whitespace-nowrap animate-marquee flex items-center">
              {/* The contact items are duplicated to create a seamless loop */}
              {[...contactItems, ...contactItems].map((item, index) => (
                <div key={index} className="mx-6">
                  <ContactInfo {...item} />
                </div>
              ))}
            </div>
          </div>

          {/* --- "CONTACT US" Button --- */}
          {/* Visible on all screen sizes */}
          <div className="flex-shrink-0 ml-4">
            <Link
              href="/#contact-us"
              className="px-5 py-2 text-xs font-bold text-deep-night bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-md hover:shadow-lg hover:shadow-solar-flare-start/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              CONTACT US
            </Link>
          </div>

        </div>
      </motion.div>
    </>
  );
};