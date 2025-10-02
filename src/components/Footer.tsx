'use client';

import { useState, FormEvent, ElementType } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
// --- All necessary icons are kept ---
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube, FaPinterestP } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { ChevronDownIcon, PaperAirplaneIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- TYPE DEFINITIONS for improved type safety ---
type ContactInfoItem = {
  icon: ElementType;
  label: string;
} & ({
  type: 'link';
  href: string;
} | {
  type: 'text';
  href?: never;
});

// --- THE FIX: ANIMATION VARIANTS (Now explicitly typed) ---
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: 'easeInOut' } 
  },
};

const accordionVariants: Variants = {
  open: { opacity: 1, height: 'auto', marginTop: '20px', transition: { duration: 0.4, ease: 'easeInOut' } },
  collapsed: { opacity: 0, height: 0, marginTop: '0px', transition: { duration: 0.4, ease: 'easeInOut' } },
};


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error' | null>(null);

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (response.ok) {
        setSubmitMessage(result.message || 'Thank you for subscribing!');
        setSubmitMessageType('success');
        setEmail('');
      } else {
        setSubmitMessage(result.message || 'Subscription failed. Please try again.');
        setSubmitMessageType('error');
      }
    } catch (error) {
      setSubmitMessage('An unexpected error occurred.');
      setSubmitMessageType('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(null), 5000);
    }
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const socialLinks = [
    { href: 'https://www.facebook.com/billsonsolarsealimited/', label: 'Facebook', icon: FaFacebookF },
    { href: 'https://www.tiktok.com/@billsonsolarealimited', label: 'TikTok', icon: FaTiktok },
    { href: 'https://www.linkedin.com/in/bill-s-5482271b1', label: 'LinkedIn', icon: FaLinkedinIn },
    { href: 'https://youtube.com/@billsonsolar', label: 'YouTube', icon: FaYoutube },
    { href: 'https://www.pinterest.com/Billsonsolarealimited/', label: 'Pinterest', icon: FaPinterestP },
    { href: 'https://www.instagram.com/billsonsolarealimited/', label: 'Instagram', icon: FaInstagram },
  ];

  const quickLinks = [
    { href: '/products', label: 'All Products' },
    { href: '/projects', label: 'Our Projects' },
    { href: '/#about-us', label: 'About Us' },
    { href: '/#contact-us', label: 'Contact Us' },
    { href: '/#blog', label: 'Blog' },
    { href: '/submit-testimonial', label: 'Share Experience' },
  ];

  const contactInfo: ContactInfoItem[] = [
    { icon: MapPinIcon, type: 'text', label: ' The Mirages Westlands' },
    { icon: EnvelopeIcon, type: 'link', href: 'mailto:Info@billsonsolar.com', label: 'Info@billsonsolar.com' },
    { icon: PhoneIcon, type: 'link', href: 'tel:+254795857846', label: '+254 795 857 846' },
  ];

  const LinkItem = ({ href, label }: { href: string; label: string }) => (
    <li>
      <Link href={href} className="flex items-center gap-2 text-gray-400 hover:text-solar-flare-start hover:translate-x-1 transition-all duration-300 ease-in-out group">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-solar-flare-start transition-colors duration-300"></span>
        {label}
      </Link>
    </li>
  );

  return (
    <footer className="relative bg-deep-night text-gray-300 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-solar-flare-start/5 via-deep-night/0 to-deep-night/0 pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-solar-flare-start to-solar-flare-end"></div>
      
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
        className="container mx-auto px-6 lg:px-8 py-16 sm:py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-16">
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="inline-flex items-center group">
              <NextImage src="/images/logo.png" alt="Bills On Solar Logo" width={56} height={56} className="transform group-hover:rotate-12 transition-transform duration-500 ease-out" />
              <span className="ml-4 text-2xl font-bold text-white group-hover:text-solar-flare-start transition-colors duration-300">
                Bills On Solar
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Powering a brighter, cleaner future for Kenya with innovative and reliable solar solutions. Your journey to energy independence starts here.
            </p>
            <div className="pt-2">
              <h3 className="text-md font-semibold text-white uppercase tracking-wider">Stay Updated</h3>
              <p className="text-gray-400 my-3 text-sm">Get the latest news, product releases, and offers.</p>
              <form onSubmit={handleSubscribe} className="relative flex items-center max-w-md">
                <EnvelopeIcon className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Your email address"
                  aria-label="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 text-sm text-white bg-white/5 rounded-lg focus:ring-2 focus:ring-solar-flare-start/80 outline-none border border-gray-700 focus:border-solar-flare-start transition-all duration-300"
                />
                <button type="submit" aria-label="Subscribe" disabled={isSubmitting} className="absolute inset-y-1.5 right-1.5 flex items-center justify-center aspect-square w-10 text-white bg-solar-flare-end rounded-md hover:bg-solar-flare-start disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors transform hover:scale-105 active:scale-95">
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
                  )}
                </button>
              </form>
              <AnimatePresence>
                {submitMessage && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`mt-3 text-xs font-medium ${submitMessageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {submitMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1"></div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <div className="border-b border-gray-800 md:border-none pb-4 md:pb-0">
                <button onClick={() => toggleAccordion('quickLinks')} className="w-full flex justify-between items-center md:pointer-events-none" aria-expanded={openAccordion === 'quickLinks'}>
                  <h3 className="text-md font-semibold text-white uppercase tracking-wider">Explore</h3>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-500 md:hidden transition-transform duration-300 ${openAccordion === 'quickLinks' ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className="hidden md:block mt-5">
                <ul className="space-y-4">
                  {quickLinks.map(link => <LinkItem key={link.href} {...link} />)}
                </ul>
              </div>
              <AnimatePresence>
                {openAccordion === 'quickLinks' && (
                  <motion.ul variants={accordionVariants} initial="collapsed" animate="open" exit="collapsed" className="space-y-4 md:hidden">
                    {quickLinks.map(link => <LinkItem key={link.href} {...link} />)}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="border-b border-gray-800 md:border-none pb-4 md:pb-0">
                <button onClick={() => toggleAccordion('contact')} className="w-full flex justify-between items-center md:pointer-events-none" aria-expanded={openAccordion === 'contact'}>
                  <h3 className="text-md font-semibold text-white uppercase tracking-wider">Get In Touch</h3>
                  <ChevronDownIcon className={`h-5 w-5 text-gray-500 md:hidden transition-transform duration-300 ${openAccordion === 'contact' ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className="hidden md:block mt-5">
                 <div className="space-y-5 not-italic">
                    {contactInfo.map(item => (
                      <div key={item.label} className="flex items-start space-x-4">
                        <item.icon className="h-6 w-6 text-solar-flare-start flex-shrink-0 mt-0.5" />
                        {item.type === 'link' ? (<a href={item.href} className="hover:text-solar-flare-start transition-colors">{item.label}</a>) : (<span className="text-gray-400">{item.label}</span>)}
                      </div>
                    ))}
                  </div>
              </div>
              <AnimatePresence>
                {openAccordion === 'contact' && (
                   <motion.div variants={accordionVariants} initial="collapsed" animate="open" exit="collapsed" className="space-y-5 not-italic md:hidden">
                      {contactInfo.map(item => (
                        <div key={item.label} className="flex items-start space-x-4">
                          <item.icon className="h-6 w-6 text-solar-flare-start flex-shrink-0 mt-0.5" />
                          {item.type === 'link' ? (<a href={item.href} className="hover:text-solar-flare-start transition-colors">{item.label}</a>) : (<span className="text-gray-400">{item.label}</span>)}
                        </div>
                      ))}
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="mt-20 border-t border-white/10 pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          <p className="text-sm text-gray-500">© {currentYear} Bills On Solar EA Limited. All Rights Reserved.</p>
          <div className="flex items-center space-x-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-700 bg-transparent transition-all duration-300 ease-in-out hover:border-solar-flare-start/70 hover:bg-solar-flare-start"
              >
                <social.icon className="h-5 w-5 text-gray-400 transition-colors duration-300 ease-in-out group-hover:text-deep-night" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
