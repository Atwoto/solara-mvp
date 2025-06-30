// src/components/Footer.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { ChevronDownIcon, PaperAirplaneIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  
  // --- NEWSLETTER FORM STATE & HANDLER ---
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error' | null>(null);

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Reset message after 5 seconds
    setTimeout(() => {
      setSubmitMessage(null);
    }, 5000);

    try {
      // This assumes you will create a '/api/subscribe' endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage(result.message || "Thank you for subscribing!");
        setSubmitMessageType('success');
        setEmail('');
      } else {
        setSubmitMessage(result.message || "Subscription failed. Please try again.");
        setSubmitMessageType('error');
      }
    } catch (error) {
      setSubmitMessage("An unexpected error occurred.");
      setSubmitMessageType('error');
    }
    setIsSubmitting(false);
  };

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
    { href: '/products', label: 'All Products' },
    { href: '/projects', label: 'Our Projects' },
    { href: '/#about-us', label: 'About Us' },
    { href: '/#contact-us', label: 'Contact Us' },
    { href: '/#blog', label: 'Blog' },
    { href: '/submit-testimonial', label: 'Share Experience' },
  ];

  const contactInfo = [
    { icon: MapPinIcon, type: 'text', label: 'Kamdries Complex, G12, Ruiru' },
    { icon: EnvelopeIcon, type: 'link', href: 'mailto:info@billseasonsolar.co.ke', label: 'info@billseasonsolar.co.ke' },
    { icon: PhoneIcon, type: 'link', href: 'tel:+254702156134', label: '+254 702 156 134' },
  ];

  return (
    // THE FIX: Use a simple background color here, and a separate div for the gradient line.
    <footer className="relative bg-deep-night text-gray-300">
      
      {/* This div is now the dedicated gradient line. It's simple and reliable. */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-solar-flare-start to-solar-flare-end"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Side: Brand & Newsletter */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center group">
              <NextImage src="/images/logo.png" alt="Bills On Solar Logo" width={48} height={48} />
              <span className="ml-3 text-xl font-bold text-white group-hover:text-solar-flare-start transition-colors">
                Bills On Solar
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Powering a brighter, cleaner future for Kenya with innovative and reliable solar solutions. Your journey to energy independence starts here.
            </p>
            <div className="pt-2">
              <h3 className="text-base font-semibold text-white uppercase tracking-wider">Stay Updated</h3>
              <p className="text-gray-400 my-3 text-sm">Get the latest news, product releases, and offers.</p>
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    aria-label="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 text-sm text-gray-900 bg-gray-200 rounded-lg focus:ring-2 focus:ring-solar-flare-end focus:border-solar-flare-end outline-none border border-transparent" 
                  />
                  <button type="submit" aria-label="Subscribe" disabled={isSubmitting} className="absolute inset-y-1 right-1 flex items-center justify-center aspect-square w-10 text-white bg-solar-flare-end rounded-md hover:bg-solar-flare-start disabled:bg-gray-400 transition-colors">
                      {isSubmitting ? (
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      ) : (
                          <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
                      )}
                  </button>
              </form>
              {submitMessage && (
                  <p className={`mt-2 text-xs font-medium ${submitMessageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>{submitMessage}</p>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Right Side: Links */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Quick Links (with mobile accordion) */}
            <div>
              <div className="border-b border-gray-700 md:border-none pb-3 md:pb-0">
                <button onClick={() => toggleAccordion('quickLinks')} className="w-full flex justify-between items-center md:pointer-events-none" aria-expanded={openAccordion === 'quickLinks'}>
                  <h3 className="text-base font-semibold text-white uppercase tracking-wider">Explore</h3>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-500 md:hidden transition-transform duration-300 ${openAccordion === 'quickLinks' ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <ul className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out md:max-h-none mt-5 ${openAccordion === 'quickLinks' ? 'max-h-60' : 'max-h-0'}`}>
                {quickLinks.map(link => (
                  <li key={link.href}><Link href={link.href} className="hover:text-solar-flare-start transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact Info (with mobile accordion) */}
            <div>
              <div className="border-b border-gray-700 md:border-none pb-3 md:pb-0">
                <button onClick={() => toggleAccordion('contact')} className="w-full flex justify-between items-center md:pointer-events-none" aria-expanded={openAccordion === 'contact'}>
                  <h3 className="text-base font-semibold text-white uppercase tracking-wider">Get In Touch</h3>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-500 md:hidden transition-transform duration-300 ${openAccordion === 'contact' ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className={`space-y-4 not-italic overflow-hidden transition-all duration-300 ease-in-out md:max-h-none mt-5 ${openAccordion === 'contact' ? 'max-h-48' : 'max-h-0'}`}>
                {contactInfo.map(item => (
                  <div key={item.label} className="flex items-start space-x-3">
                    <item.icon className="h-5 w-5 text-solar-flare-start flex-shrink-0 mt-0.5" />
                    {item.type === 'link' ? (
                      <Link href={item.href!} className="hover:text-solar-flare-start transition-colors">{item.label}</Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom: Copyright & Socials */}
        <div className="mt-16 border-t border-gray-800 pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-500">
            © {currentYear} Bills On Solar EA Limited. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-2">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="text-gray-400 hover:text-solar-flare-start transform hover:scale-110 transition-all p-2 rounded-full hover:bg-gray-800">
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;