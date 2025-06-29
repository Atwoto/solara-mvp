// src/components/ServiceDetailClient.tsx
'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceImageGalleryProps {
  imageUrls: string[] | null | undefined;
  serviceTitle: string;
}

export default function ServiceDetailClient({ imageUrls, serviceTitle }: ServiceImageGalleryProps) {
  // If there are no images, render nothing.
  if (!imageUrls || imageUrls.length === 0) {
    return (
        <div className="relative aspect-video w-full rounded-lg bg-gray-200 shadow-lg">
            {/* Optional: Placeholder */}
        </div>
    );
  }

  // State to track the currently selected image. Default to the first one.
  const [selectedImageUrl, setSelectedImageUrl] = useState(imageUrls[0]);

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Main Image Display */}
      <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-lg bg-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImageUrl} // This key is crucial for the animation to trigger
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            <NextImage
              src={selectedImageUrl}
              alt={`Main image for ${serviceTitle}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail Strip - only show if there's more than one image */}
      {imageUrls.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {imageUrls.map((url) => (
            <button
              key={url}
              onClick={() => setSelectedImageUrl(url)}
              className={`relative aspect-square rounded-md overflow-hidden transition-all duration-200
                ${selectedImageUrl === url ? 'ring-2 ring-solar-flare-start ring-offset-2' : 'hover:opacity-80'}`
              }
            >
              <NextImage
                src={url}
                alt={`${serviceTitle} thumbnail`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}