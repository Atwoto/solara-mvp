'use client';

import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/solid';

// The reusable sub-component remains the same
const ContactInfo = ({ icon, text, href }: { icon: React.ReactNode; text: string; href: string }) => (
  <a 
    href={href} 
    className="flex items-center text-xs text-gray-300 hover:text-white transition-colors duration-200"
  >
    <span className="text-solar-flare-start">{icon}</span>
    <span className="ml-2">{text}</span>
  </a>
);

export const TopBar = () => {
  return (
    <div className="bg-graphite text-white w-full">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        
        {/* --- NEW: Mobile-only Phone Number --- */}
        {/* This `flex md:hidden` block is ONLY visible on small screens. */}
        <div className="flex md:hidden">
          <ContactInfo 
            icon={<PhoneIcon className="h-4 w-4" />} 
            text="0737555222" 
            href="tel:0737555222"
          />
        </div>

        {/* --- This is the existing Desktop view --- */}
        {/* This `hidden md:flex` block is ONLY visible on medium screens and up. */}
        <div className="hidden md:flex items-center space-x-6">
          <ContactInfo 
            icon={<MapPinIcon className="h-4 w-4" />} 
            text="Ashray industrial park, Off Enterprise Road" 
            href="https://maps.google.com/?q=Ashray+industrial+park"
          />
          <ContactInfo 
            icon={<EnvelopeIcon className="h-4 w-4" />} 
            text="info@billsonsolar.co.ke" 
            href="mailto:info@billsonsolar.co.ke"
          />
           <ContactInfo 
            icon={<PhoneIcon className="h-4 w-4" />} 
            text="0737555222" 
            href="tel:0737555222"
          />
        </div>

        {/* The "Contact Us" button remains visible on all screen sizes */}
        <div>
          <Link 
            href="/contact" 
            className="px-4 py-1.5 text-xs font-bold text-deep-night bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-sm hover:opacity-90 transition-opacity"
          >
            CONTACT US
          </Link>
        </div>

      </div>
    </div>
  );
};