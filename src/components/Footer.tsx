// src/components/Footer.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { ChevronDownIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid'; // For accordion and form button

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // State to manage which accordion is open on mobile. 'null' means all are closed.
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const socialLinks = [
    { href: 'https://facebook.com/yourpage', label: 'Facebook', icon: FaFacebookF },
    { href: 'https://x.com/yourprofile', label: 'X (Twitter)', icon: FaXTwitter },
    { href: 'https://instagram.com/yourprofile', label: 'Instagram', icon: FaInstagram },
    { href: 'https://linkedin.com/company/yourcompany', label: 'LinkedIn', icon: FaLinkedinIn },
  ];

  const quickLinks = [
    { href: '/products', label: 'Products' },
    { href: '/projects', label: 'Projects' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/submit-testimonial', label: 'Share Your Experience' },
    { href: '/blog', label: 'Blog' },
  ];

  const contactInfo = [
    { type: 'text', label: 'Nairobi, Kenya' },
    { type: 'link', href: 'mailto:info@billsonsolar.co.ke', label: 'info@billsonsolar.co.ke' },
    { type: 'link', href: 'tel:+254712345678', label: '+254 712 345 678' },
  ];

  return (
    <footer className="bg-deep-night text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-8 text-sm">
          
          {/* Brand Info & Socials (takes more space on desktop) */}
          <div className="md:col-span-12 lg:col-span-4 space-y-6 text-center md:text-left">
            <Link href="/" className="inline-flex items-center group justify-center md:justify-start">
              <NextImage src="/images/logo.png" alt="Bills On Solar EA Limited Logo" width={48} height={48} />
              <span className="ml-3 text-xl font-bold text-white group-hover:text-solar-flare-start transition-colors">
                Bills On Solar
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm mx-auto md:mx-0">
              Powering a brighter, cleaner future for Kenya with innovative solar solutions.
            </p>
            <div className="flex items-center space-x-3 justify-center md:justify-start">
              {socialLinks.map((social) => (
                <a 
                  key={social.label} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={social.label}
                  className="text-gray-400 hover:text-solar-flare-start transform hover:scale-110 transition-all duration-200 ease-in-out p-2 rounded-full hover:bg-gray-700/50"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer div for layout on desktop */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Quick Links (with mobile accordion) */}
          <div className="md:col-span-4 lg:col-span-2">
            <div className="border-b border-gray-700 md:border-none pb-3 md:pb-0">
              <button 
                className="w-full flex justify-between items-center md:pointer-events-none"
                onClick={() => toggleAccordion('quickLinks')}
                aria-expanded={openAccordion === 'quickLinks'}
              >
                <h3 className="text-base font-semibold text-white uppercase tracking-wider">Quick Links</h3>
                <ChevronDownIcon className={`h-5 w-5 text-gray-500 md:hidden transition-transform duration-300 ${openAccordion === 'quickLinks' ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <ul className={`space-y-3 mt-5 overflow-hidden transition-all duration-500 ease-in-out md:max-h-none md:mt-5 ${openAccordion === 'quickLinks' ? 'max-h-60' : 'max-h-0'}`}>
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-solar-flare-start transition-colors duration-200 ease-in-out">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info (with mobile accordion) */}
          <div className="md:col-span-4 lg:col-span-2">
            <div className="border-b border-gray-700 md:border-none pb-3 md:pb-0">
              <button 
                className="w-full flex justify-between items-center md:pointer-events-none"
                onClick={() => toggleAccordion('contact')}
                aria-expanded={openAccordion === 'contact'}
              >
                <h3 className="text-base font-semibold text-white uppercase tracking-wider">Contact Info</h3>
                <ChevronDownIcon className={`h-5 w-5 text-gray-500 md:hidden transition-transform duration-300 ${openAccordion === 'contact' ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <address className={`space-y-3 not-italic overflow-hidden transition-all duration-500 ease-in-out md:max-h-none md:mt-5 ${openAccordion === 'contact' ? 'max-h-40' : 'max-h-0'}`}>
              {contactInfo.map(item => (
                item.type === 'link' ? (
                  <p key={item.href}>
                    <Link href={item.href!} className="hover:text-solar-flare-start transition-colors">
                      {item.label}
                    </Link>
                  </p>
                ) : (
                  <p key={item.label}>{item.label}</p>
                )
              ))}
            </address>
          </div>

          {/* Stay Updated Form */}
          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="text-base font-semibold text-white mb-5 uppercase tracking-wider">Stay Updated</h3>
            <p className="text-gray-400 mb-4">Get the latest news, product releases, and special offers directly to your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  aria-label="Your email address"
                  className="w-full pl-4 pr-12 py-3 text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start outline-none border border-transparent" 
                />
                <button 
                  type="submit" 
                  aria-label="Subscribe"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-solar-flare-start hover:text-solar-flare-end transition-colors"
                >
                    <PaperAirplaneIcon className="h-5 w-5"/>
                </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 border-t border-gray-700 pt-8 text-center">
          <p className="text-xs text-gray-400">
            © {currentYear} Bills On Solar EA Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;