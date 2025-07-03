// src/components/admin/PageHeader.tsx
'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  children?: React.ReactNode;
}

const PageHeader = ({
  title,
  description,
  showBackButton = false,
  backButtonHref,
  children,
}: PageHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      router.back();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-8 pb-5 border-b border-slate-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="mb-3 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="mt-5 flex sm:mt-0 sm:ml-4">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;
