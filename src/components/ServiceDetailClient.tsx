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
  if (!imageUrls || imageUrls.length === 0) {
    return (
        <div className="relative aspect-video w-full rounded-lg bg-gray-200 shadow-lg">
            {/* Placeholder for when no images exist */}
        </div>
    );
  }

  const [selectedImageUrl, setSelectedImageUrl] = useState(imageUrls[0]);

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Main Image Display (This part is working correctly) */}
      <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-lg bg-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImageUrl}
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

      {/* --- THIS IS THE CORRECTED THUMBNAIL SECTION --- */}
      {/* Only show if there's more than one image */}
      {imageUrls.length > 1 && (
        // Use a flex container that can scroll horizontally if needed
        <div className="flex space-x-3 overflow-x-auto p-1">
          {imageUrls.map((url) => (
            <button
              key={url}
              onClick={() => setSelectedImageUrl(url)}
              // Give the button an explicit width and height, and make it a flex-shrink-0 so it doesn't get squashed
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden transition-all duration-200
                ${selectedImageUrl === url ? 'ring-2 ring-solar-flare-start ring-offset-2' : 'hover:opacity-80'}`
              }
            >
              <NextImage
                src={url}
                alt={`${serviceTitle} thumbnail`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 10vw, 5vw" // Helps Next.js optimize image loading
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}