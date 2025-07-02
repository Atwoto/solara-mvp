'use client';

import { useComparison } from '@/context/ComparisonContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import Image from 'next/image';
import { XMarkIcon, TrashIcon, ScaleIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

// --- ANIMATION VARIANTS ---
const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] } },
};

const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// --- REDESIGNED COMPARISON MODAL ---
interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ComparisonModal = ({ isOpen, onClose }: ComparisonModalProps) => {
    const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
    const { addToCart } = useCart();
    const [addedToCartId, setAddedToCartId] = useState<string | null>(null);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
        setAddedToCartId(product.id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

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
    
    const getProductValue = (product: Product, key: keyof Product) => {
        const value = product[key as keyof Product];
        return value !== null && value !== undefined ? value : 'N/A';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div
                        variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                        className="bg-white/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        <header className="flex items-center justify-between p-5 border-b border-black/10">
                            <h2 className="text-xl font-bold text-deep-night flex items-center gap-3"><ScaleIcon className="h-6 w-6 text-solar-flare-end" /> Compare Products ({comparisonItems.length})</h2>
                            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-black/10 transition-colors" aria-label="Close comparison modal"><XMarkIcon className="h-6 w-6" /></button>
                        </header>

                        {comparisonItems.length === 0 ? (
                            <div className="p-10 text-center flex-grow flex flex-col items-center justify-center">
                                <ScaleIcon className="h-20 w-20 text-gray-300 mb-4" />
                                <p className="text-lg font-semibold text-graphite">Your Comparison List is Empty</p>
                                <p className="text-sm mt-1 text-gray-500">Add up to 3 products to see a side-by-side comparison.</p>
                                <button onClick={onClose} className="mt-6 px-8 py-2.5 bg-solar-flare-start text-deep-night font-semibold rounded-full hover:bg-solar-flare-end transition-colors shadow-md">Continue Shopping</button>
                            </div>
                        ) : (
                            <div className="flex-grow overflow-auto p-2 sm:p-4">
                                <div className="min-w-[800px]">
                                    <motion.div layout variants={contentVariants} initial="hidden" animate="visible">
                                        {/* Header Row with Product Cards */}
                                        <div className="grid grid-cols-4 gap-4 sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10">
                                            <div className="col-span-1"></div> {/* Empty cell for alignment */}
                                            <AnimatePresence>
                                                {comparisonItems.map(product => (
                                                    <motion.div
                                                        layout
                                                        key={product.id}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="col-span-1 text-center"
                                                    >
                                                        <Link href={`/products/${product.id}`} onClick={onClose}>
                                                            <div className="relative w-24 h-24 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-100">
                                                                {product.image_url && product.image_url[0] ? (
                                                                    <Image src={product.image_url[0]} alt={product.name} fill className="object-cover" sizes="96px" />
                                                                ) : null}
                                                            </div>
                                                            <h3 className="text-sm font-bold text-graphite line-clamp-2 hover:text-solar-flare-end transition-colors">{product.name}</h3>
                                                        </Link>
                                                        <button onClick={() => removeFromComparison(product.id)} className="mt-2 text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 mx-auto"><TrashIcon className="h-3 w-3" />Remove</button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        {/* Attribute Rows */}
                                        <div className="divide-y divide-gray-200/80">
                                            {attributes.map(attr => {
                                                const highlightValue = getHighlightValue(attr.key as keyof Product, attr.highlight as 'min' | 'max');
                                                return (
                                                    <motion.div variants={itemVariants} key={attr.key} className="grid grid-cols-4 gap-4 items-center min-h-[64px] py-2">
                                                        <div className="col-span-1 text-sm font-semibold text-gray-600 px-4">{attr.label}</div>
                                                        {comparisonItems.map(product => {
                                                            const value = getProductValue(product, attr.key as keyof Product);
                                                            const isHighlighted = highlightValue !== null && value === highlightValue;
                                                            return (
                                                                <div key={`${product.id}-${attr.key}`} className={`col-span-1 text-sm text-center text-gray-800 px-4 ${isHighlighted ? 'font-bold' : ''}`}>
                                                                    <div className="relative inline-block">
                                                                        <span className={`px-2 py-1.5 rounded-md ${isHighlighted && attr.highlight === 'min' ? 'bg-green-100 text-green-800' : isHighlighted && attr.highlight === 'max' ? 'bg-blue-100 text-blue-800' : ''}`}>
                                                                            {attr.key === 'price' && typeof value === 'number' ? `${attr.unit} ${value.toLocaleString()}` : value ? `${value}${attr.unit || ''}` : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Add to Cart Button Row */}
                                        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4 items-center pt-6 mt-4 border-t">
                                            <div className="col-span-1"></div> {/* Empty cell for alignment */}
                                            {comparisonItems.map(product => (
                                                <div key={`${product.id}-cart`} className="col-span-1 flex justify-center">
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={addedToCartId === product.id}
                                                        className={`px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md flex items-center justify-center gap-2 w-36 h-10 transition-all duration-300 ease-in-out transform active:scale-95 ${
                                                            addedToCartId === product.id ? 'bg-green-500' : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:shadow-lg'
                                                        }`}
                                                    >
                                                        <AnimatePresence mode="wait">
                                                            {addedToCartId === product.id ? (
                                                                <motion.span key="added" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-2">
                                                                    <CheckIcon className="h-5 w-5"/> Added
                                                                </motion.span>
                                                            ) : (
                                                                <motion.span key="add" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-2">
                                                                    <ShoppingCartIcon className="h-5 w-5"/> Add to Cart
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>
                                                    </button>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {comparisonItems.length > 0 && (
                            <footer className="p-4 border-t border-black/10 flex justify-end items-center gap-3 bg-white/50">
                                <button onClick={clearComparison} className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">Clear All</button>
                                <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-deep-night bg-solar-flare-start hover:bg-solar-flare-end rounded-full transition-colors">Done</button>
                            </footer>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ComparisonModal;
