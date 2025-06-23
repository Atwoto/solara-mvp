'use client';

import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';

// A small, reusable component for each piece of contact info
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
    // The main container for the top bar
    <div className="bg-graphite text-white w-full">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        
        {/* Contact Info - This part will hide on smaller screens */}
        <div className="hidden md:flex items-center space-x-6">
          <ContactInfo 
            icon={<MapPinIcon className="h-4 w-4" />} 
            text="Ashray industrial park, Off Enterprise Road" 
            href="https://maps.google.com/?q=Ashray+industrial+park" // Example link
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

        {/* This div is to push the button to the right when info is hidden */}
        <div className="flex-grow md:hidden"></div>

        {/* Contact Us Button */}
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