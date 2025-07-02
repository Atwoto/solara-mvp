// /src/app/compare/page.tsx

'use client';

import { useState } from 'react';
import { useComparison } from '@/context/useComparison';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { XMarkIcon, TrashIcon, ScaleIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/solid';
import PageHeader from '@/components/PageHeader';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// --- MAIN COMPARE PAGE COMPONENT ---
export default function ComparePage() {
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

    return (
        <>
            <PageHeader
                title="Compare Products"
                subtitle="View a side-by-side comparison of your selected items to make the best choice."
                breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Compare', href: '/compare' }]}
            />
            <main className="bg-gray-50 py-16 sm:py-20">
                <div className="container mx-auto px-4">
                    {comparisonItems.length === 0 ? (
                        <div className="text-center bg-white rounded-2xl shadow-lg p-10 mt-8 max-w-lg mx-auto">
                            <ScaleIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                            <h2 className="text-2xl font-semibold text-graphite mb-3">Your Comparison List is Empty</h2>
                            <p className="text-gray-500 mb-8">Add products to compare by clicking the compare icon on any product card.</p>
                            <Link href="/products" className="inline-block px-8 py-3 text-base font-semibold text-deep-night bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200/80"
                        >
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-xl font-bold text-deep-night">Comparing {comparisonItems.length} Item(s)</h2>
                                <button onClick={clearComparison} className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                    Clear All
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <div className="min-w-[800px]">
                                    <div className="grid grid-cols-4 gap-4">
                                        {/* Attribute Labels Column */}
                                        <div className="col-span-1 space-y-4 pt-[280px]">
                                            {attributes.map(attr => (
                                                <motion.div variants={itemVariants} key={attr.key} className="h-16 flex items-center p-4 text-sm font-semibold text-gray-600">
                                                    {attr.label}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Product Columns */}
                                        <AnimatePresence>
                                            {comparisonItems.map(product => (
                                                <motion.div
                                                    layout
                                                    key={product.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="col-span-1 bg-gray-50/70 rounded-xl border"
                                                >
                                                    <div className="p-4 border-b text-center sticky top-0 bg-gray-50/70 rounded-t-xl">
                                                        <Link href={`/products/${product.id}`}>
                                                            <div className="relative w-32 h-32 mx-auto mb-3 rounded-lg overflow-hidden bg-white">
                                                                {product.image_url && product.image_url[0] && (
                                                                    <Image src={product.image_url[0]} alt={product.name} fill className="object-contain" sizes="128px" />
                                                                )}
                                                            </div>
                                                            <h3 className="text-sm font-bold text-graphite line-clamp-2 hover:text-solar-flare-end transition-colors">{product.name}</h3>
                                                        </Link>
                                                        <button onClick={() => removeFromComparison(product.id)} className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1 mx-auto"><TrashIcon className="h-3 w-3" />Remove</button>
                                                    </div>
                                                    <div className="space-y-4 p-4">
                                                        {attributes.map(attr => {
                                                            const highlightValue = getHighlightValue(attr.key as keyof Product, attr.highlight as 'min' | 'max');
                                                            const value = product[attr.key as keyof Product];
                                                            const isHighlighted = highlightValue !== null && value === highlightValue;
                                                            return (
                                                                <div key={`${product.id}-${attr.key}`} className="h-16 flex items-center justify-center text-center text-sm text-gray-800">
                                                                    <div className="relative">
                                                                        {attr.key === 'price' && typeof value === 'number' ? `${attr.unit} ${value.toLocaleString()}` : value ? `${value}${attr.unit || ''}` : 'N/A'}
                                                                        {isHighlighted && (
                                                                            <motion.span
                                                                                initial={{ opacity: 0, scale: 0.5 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                className={`absolute -top-5 -right-2 text-xs font-bold px-2 py-0.5 rounded-full ${attr.highlight === 'min' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                                                                            >
                                                                                Best
                                                                            </motion.span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="h-16 flex items-center justify-center">
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
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </>
    );
}
