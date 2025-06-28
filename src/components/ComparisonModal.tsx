// src/components/ComparisonModal.tsx
'use client';

import { useComparison } from '@/context/ComparisonContext';
import { Product } from '@/types';
import Image from 'next/image';
import { XMarkIcon, TrashIcon, ScaleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
} as const;
const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
} as const;
const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
} as const;
const colVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
} as const;

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComparisonModal = ({ isOpen, onClose }: ComparisonModalProps) => {
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();

  const attributes = [
    { label: 'Price', key: 'price', unit: 'Ksh', highlight: 'min' },
    { label: 'Wattage', key: 'wattage', unit: 'W', highlight: 'max' },
    { label: 'Category', key: 'category' },
    { label: 'Description', key: 'description' },
  ];

  const getHighlightValue = (key: keyof Product, highlight: 'min' | 'max' | undefined) => {
    if (!highlight) return null;
    const values = comparisonItems.map(p => p[key]).filter(v => typeof v === 'number') as number[];
    if (values.length < 2) return null;
    return highlight === 'min' ? Math.min(...values) : Math.max(...values);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            variants={modalVariants} initial="hidden" animate="visible" exit="hidden"
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <header className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold text-deep-night flex items-center gap-3"><ScaleIcon className="h-6 w-6 text-solar-flare-end"/> Compare Products ({comparisonItems.length})</h2>
              <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors" aria-label="Close comparison modal"><XMarkIcon className="h-6 w-6" /></button>
            </header>

            {comparisonItems.length === 0 ? (
              <div className="p-10 text-center flex-grow flex flex-col items-center justify-center">
                <ScaleIcon className="h-20 w-20 text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-graphite">Your Comparison List is Empty</p>
                <p className="text-sm mt-1 text-gray-500">Add up to 3 products to see a side-by-side comparison.</p>
                <button onClick={onClose} className="mt-6 px-8 py-2.5 bg-solar-flare-start text-white font-semibold rounded-full hover:bg-solar-flare-end transition-colors shadow-md">Continue Shopping</button>
              </div>
            ) : (
              <div className="flex-grow overflow-auto p-1 sm:p-2">
                <div className="min-w-[700px]">
                  <motion.div layout className="grid grid-cols-4 gap-4 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <div className="col-span-1"></div>
                    <AnimatePresence>
                      {comparisonItems.map(product => (
                        <motion.div layout variants={colVariants} initial="hidden" animate="visible" exit="hidden" key={product.id} className="col-span-1 flex flex-col items-center text-center">
                          {/* *** THIS IS THE FIX: Use the first image from the array *** */}
                          <div className="relative w-24 h-24 mb-3 rounded-lg overflow-hidden">
                            {product.image_url && product.image_url[0] ? (
                              <Image src={product.image_url[0]} alt={product.name} fill className="object-cover" />
                            ) : null}
                          </div>
                          <h3 className="text-sm font-bold text-graphite line-clamp-2">{product.name}</h3>
                          <button onClick={() => removeFromComparison(product.id)} className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1"><TrashIcon className="h-3 w-3" />Remove</button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div layout variants={tableVariants} initial="hidden" animate="visible" className="divide-y divide-gray-200">
                    {attributes.map(attr => {
                      const highlightValue = getHighlightValue(attr.key as keyof Product, attr.highlight as 'min' | 'max');
                      return (
                        <motion.div layout variants={rowVariants} key={attr.key} className="grid grid-cols-4 gap-4 items-center odd:bg-gray-50/70 p-4">
                          <div className="col-span-1 text-sm font-semibold text-gray-600">{attr.label}</div>
                          <AnimatePresence>
                            {comparisonItems.map(product => {
                              const value = product[attr.key as keyof Product];
                              const isHighlighted = highlightValue !== null && value === highlightValue;
                              return (
                                <motion.div layout variants={colVariants} initial="hidden" animate="visible" exit="hidden" key={`${product.id}-${attr.key}`} className={`col-span-1 text-sm text-center ${isHighlighted ? 'font-bold' : ''}`}>
                                  <span className={`p-1.5 rounded-md ${isHighlighted && attr.highlight === 'min' ? 'bg-green-100 text-green-800' : isHighlighted && attr.highlight === 'max' ? 'bg-blue-100 text-blue-800' : 'text-gray-800'}`}>
                                    {attr.key === 'price' && typeof value === 'number' ? `${attr.unit} ${value.toLocaleString()}` : value ? `${value}${attr.unit || ''}` : 'N/A'}
                                  </span>
                                </motion.div>
                              )
                            })}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </div>
              </div>
            )}

            {comparisonItems.length > 0 && (
              <footer className="p-4 border-t flex justify-end items-center gap-3 bg-gray-50/70">
                 <button onClick={clearComparison} className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">Clear All</button>
                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-solar-flare-start hover:bg-solar-flare-end rounded-full transition-colors">Done</button>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComparisonModal;