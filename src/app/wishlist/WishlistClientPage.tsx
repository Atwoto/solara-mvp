'use client';

import { useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { HeartIcon as HeartSolidIcon, CheckIcon } from '@heroicons/react/24/solid';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: 'easeOut' } },
};

// --- WISHLIST ITEM COMPONENT ---
const WishlistItem = ({
    product,
    onMoveToCart,
    onRemove,
    isMoved,
}: {
    product: Product;
    onMoveToCart: () => void;
    onRemove: () => void;
    isMoved: boolean;
}) => {
    return (
        <motion.div
            layout
            variants={itemVariants}
            exit="exit"
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-4 rounded-2xl shadow-md border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300"
        >
            <div className="relative h-32 w-32 sm:h-24 sm:w-24 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" />
                {product.image_url && product.image_url[0] && (
                    <Image
                        src={product.image_url[0]}
                        alt={product.name}
                        fill
                        className="absolute inset-0 w-full h-full object-cover"
                        sizes="(max-width: 768px) 128px, (max-width: 1200px) 96px, 96px"
                        loading="lazy"
                    />
                )}
            </div>
            <div className="flex-grow text-center sm:text-left">
                <Link href={`/products/${product.id}`}>
                    <h3 className="text-md font-semibold text-graphite hover:text-solar-flare-start transition-colors line-clamp-2">{product.name}</h3>
                </Link>
                <p className="text-lg font-bold text-deep-night my-2">Ksh {product.price.toLocaleString()}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:ml-auto w-full sm:w-auto">
                <button
                    onClick={onMoveToCart}
                    disabled={isMoved}
                    className={`w-full sm:w-auto flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-md transition-all duration-300 ${
                        isMoved ? 'bg-green-500' : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90'
                    }`}
                >
                    <AnimatePresence mode="wait">
                        {isMoved ? (
                            <motion.span key="moved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                <CheckIcon className="h-5 w-5" /> Moved to Cart
                            </motion.span>
                        ) : (
                            <motion.span key="move" className="flex items-center gap-2">
                                <ShoppingCartIcon className="h-5 w-5" /> Move to Cart
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
                <button
                    onClick={onRemove}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </motion.div>
    );
};


// --- WISHLIST CLIENT PAGE ---
const WishlistClientPage = () => {
    const { wishlistProducts, isLoading: isWishlistLoading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [movedToCartId, setMovedToCartId] = useState<string | null>(null);

    const handleMoveToCart = (product: Product) => {
        addToCart(product, 1);
        removeFromWishlist(product.id);
        setMovedToCartId(product.id);
    };

    if (isWishlistLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                    <HeartSolidIcon className="h-16 w-16 text-red-200 mb-4 animate-pulse" />
                    <p className="text-gray-500 text-lg">Loading Your Saved Items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-300px)] py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite">
                        My <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">Wishlist</span>
                    </h1>
                    <p className="mt-3 text-gray-600 max-w-xl mx-auto">Your personal collection of favorite solar products. Ready to make them yours?</p>
                </div>

                {wishlistProducts.length === 0 ? (
                    <div className="text-center bg-white rounded-2xl shadow-lg p-10 mt-8 max-w-lg mx-auto">
                        <HeartSolidIcon className="h-20 w-20 text-gray-200 mx-auto mb-6" />
                        <h2 className="text-2xl font-semibold text-graphite mb-3">Your Wishlist is a Blank Canvas</h2>
                        <p className="text-gray-500 mb-8">Save your favorite items by clicking the heart icon, and find them here later.</p>
                        <Link href="/products" className="inline-block px-8 py-3 text-base font-semibold text-deep-night bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            Discover Products
                        </Link>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-4xl mx-auto space-y-4"
                    >
                        <AnimatePresence>
                            {wishlistProducts.map((product) => (
                                <WishlistItem
                                    key={product.id}
                                    product={product}
                                    onMoveToCart={() => handleMoveToCart(product)}
                                    onRemove={() => removeFromWishlist(product.id)}
                                    isMoved={movedToCartId === product.id}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default WishlistClientPage;
