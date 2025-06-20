// src/components/admin/PageHeader.tsx
'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation'; // Only if using router.back()

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backButtonHref?: string; // Optional: specific href for back button
  children?: React.ReactNode; // For action buttons like "Add New"
}

const PageHeader = ({
  title,
  description,
  showBackButton = false,
  backButtonHref,
  children,
}: PageHeaderProps) => {
  const router = useRouter(); // If you want a generic back button

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      router.back(); // Generic browser back
    }
  };

  return (
    <div className="mb-8 pb-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="mb-2 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900 truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="mt-4 flex sm:mt-0 sm:ml-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;