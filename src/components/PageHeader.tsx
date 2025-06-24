// src/components/PageHeader.tsx
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import NextImage from 'next/image';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
} as const;

interface Breadcrumb {
  name: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  backgroundImageUrl?: string;
  breadcrumbs?: Breadcrumb[];
}

const PageHeader = ({ title, subtitle, backgroundImageUrl, breadcrumbs }: PageHeaderProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <div ref={ref} className={`relative w-full text-white overflow-hidden ${!backgroundImageUrl ? 'bg-gradient-to-br from-deep-night to-slate-800' : ''}`}>
      {backgroundImageUrl && (
        <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
          <NextImage src={backgroundImageUrl} alt={`${title} background`} fill className="object-cover" priority />
        </motion.div>
      )}
      <div className="absolute inset-0 z-10 bg-black/60"></div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-20 container mx-auto px-4 text-center py-20 sm:py-28">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <motion.nav variants={itemVariants} className="flex justify-center items-center text-sm mb-4">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronRightIcon className="h-4 w-4 mx-1.5 text-gray-400" />}
                <Link href={crumb.href} className={`transition-colors ${index === breadcrumbs.length - 1 ? 'text-white font-semibold cursor-default' : 'text-gray-300 hover:text-solar-flare-start'}`}>
                  {crumb.name}
                </Link>
              </div>
            ))}
          </motion.nav>
        )}
        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold tracking-tight text-shadow-lg">{title}</motion.h1>
        <motion.p variants={itemVariants} className="text-lg mt-3 opacity-90 max-w-2xl mx-auto text-shadow-sm">{subtitle}</motion.p>
      </motion.div>
    </div>
  );
};

export default PageHeader;