// src/components/ServiceDetailClient.tsx
'use client';

import { useState } from 'react';
// import NextImage from 'next/image'; // No longer needed
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
      {/* Main Image Display */}
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
            {/* --- THIS IS THE FIX --- */}
            <img
              src={selectedImageUrl}
              alt={`Main image for ${serviceTitle}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail Section */}
      {imageUrls.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto p-1">
          {imageUrls.map((url) => (
            <button
              key={url}
              onClick={() => setSelectedImageUrl(url)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden transition-all duration-200
                ${selectedImageUrl === url ? 'ring-2 ring-solar-flare-start ring-offset-2' : 'hover:opacity-80'}`
              }
            >
              {/* --- THIS IS THE FIX --- */}
              <img
                src={url}
                alt={`${serviceTitle} thumbnail`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
