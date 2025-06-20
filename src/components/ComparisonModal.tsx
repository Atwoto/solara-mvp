// src/components/ComparisonModal.tsx
'use client';

import { useComparison, Product } from '@/context/ComparisonContext';
import Image from 'next/image';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/solid';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComparisonModal = ({ isOpen, onClose }: ComparisonModalProps) => {
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-deep-night">
            Compare Products ({comparisonItems.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close comparison modal"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        {/* Modal Content */}
        {comparisonItems.length === 0 ? (
          <div className="p-6 sm:p-10 text-center text-gray-500 flex-grow flex flex-col items-center justify-center">
            <ScaleIcon className="h-16 w-16 text-gray-300 mb-4" /> {/* Assuming you have ScaleIcon or similar */}
            <p className="text-lg">No products selected for comparison.</p>
            <p className="text-sm mt-1">Add products from the product listings to compare them here.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-solar-flare-start text-white rounded-full hover:bg-solar-flare-end transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="p-3 sm:p-6 overflow-y-auto flex-grow">
            <div className={`grid gap-4 sm:gap-6 ${comparisonItems.length === 1 ? 'grid-cols-1 md:grid-cols-1' : 
                                               comparisonItems.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                                               'grid-cols-1 md:grid-cols-3'}`}>
              {comparisonItems.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col bg-gray-50/50">
                  <div className="relative w-full h-40 sm:h-48 mb-3 rounded overflow-hidden">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <h3 className="text-md sm:text-lg font-semibold text-graphite mb-1">{product.name}</h3>
                  <p className="text-xl sm:text-2xl font-bold text-deep-night mb-2">Ksh {product.price.toLocaleString()}</p>
                  
                  {/* Add more product details for comparison here */}
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-3 flex-grow">
                    {product.wattage && <p><strong>Wattage:</strong> {product.wattage}W</p>}
                    {product.category && <p><strong>Category:</strong> {product.category}</p>}
                    {/* Add other fields like description, dimensions, etc. */}
                    {product.description && <p className="mt-1 line-clamp-3"><strong>Desc:</strong> {product.description}</p>}
                  </div>
                  
                  <button
                    onClick={() => removeFromComparison(product.id)}
                    className="mt-auto w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm text-red-600 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {comparisonItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3">
             <button
              onClick={clearComparison}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              Clear All Comparison
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-solar-flare-start hover:bg-solar-flare-end rounded-full transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// You might need to import ScaleIcon if it's not globally available
import { ScaleIcon } from '@heroicons/react/24/outline'; // Or wherever it is

export default ComparisonModal;