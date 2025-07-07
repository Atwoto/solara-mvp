'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useComparison } from '@/context/ComparisonContext';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckIcon, HeartIcon as HeartSolid, PhoneArrowUpRightIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ArrowsRightLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product as ProductType } from '@/types';

// --- ANIMATION VARIANTS ---
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

interface ProductCatalogProps {
    products: ProductType[];
    gridCols?: string;
}

// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({
    product,
    inWishlist,
    isComparing,
    isWishlistLoading,
    isCompareDisabled,
    isAddedToCart,
    onAddToCart,
    onWishlistToggle,
    onCompareToggle,
    priority,
}: {
    product: ProductType;
    inWishlist: boolean;
    isComparing: boolean;
    isWishlistLoading: boolean;
    isCompareDisabled: boolean;
    isAddedToCart: boolean;
    onAddToCart: (e: React.MouseEvent) => void;
    onWishlistToggle: (e: React.MouseEvent) => void;
    onCompareToggle: (e: React.MouseEvent) => void;
    priority: boolean;
}) => {
    return (
        <div className="relative group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1">
            <div className="relative w-full h-64 bg-gray-200 rounded-t-2xl overflow-hidden">
                <Link href={`/products/${product.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${product.name}`} />
                {product.image_url && product.image_url[0] ? (
                    <Image
                        src={product.image_url[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">No Image</div>
                )}
                
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={onWishlistToggle}
                        title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        className="p-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                        disabled={isWishlistLoading}
                        aria-label="Toggle Wishlist"
                    >
                        {inWishlist ? <HeartSolid className="h-5 w-5 text-red-500"/> : <HeartOutline className="h-5 w-5 text-gray-600"/>}
                    </button>
                    <button
                        onClick={onCompareToggle}
                        title={isComparing ? "Remove from Compare" : "Add to Compare"}
                        className="p-2.5 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-orange-100 disabled:opacity-50 transition-colors"
                        disabled={isCompareDisabled}
                        aria-label="Toggle Compare"
                    >
                        {isComparing ? <ArrowsRightLeftIcon className="h-5 w-5 text-solar-flare-end"/> : <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600"/>}
                    </button>
                </div>
            </div>

            <div className="flex flex-col flex-1 p-4">
                <div className="flex-1">
                    {product.category && <p className="text-xs text-gray-500 mb-1">{product.category}</p>}
                    <Link href={`/products/${product.id}`}>
                        <h3 className="text-md font-semibold text-graphite group-hover:text-solar-flare-end transition-colors line-clamp-2">{product.name}</h3>
                    </Link>
                </div>
                <div className="mt-4 flex items-end justify-between">
                    {/* --- THIS IS THE FIX --- */}
                    {/* If price is greater than 0, show price and Add to Cart button */}
                    {product.price > 0 ? (
                        <>
                            <span className="text-xl font-bold text-deep-night">Ksh {product.price.toLocaleString()}</span>
                            <button
                                onClick={onAddToCart}
                                disabled={isAddedToCart}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md flex items-center justify-center gap-2 w-32 h-10 transition-all duration-300 ease-in-out transform active:scale-95 ${
                                    isAddedToCart ? 'bg-green-500' : 'bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:shadow-lg'
                                }`}
                            >
                                <AnimatePresence mode="wait">
                                    {isAddedToCart ? (
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
                        </>
                    ) : (
                        /* If price is 0, show "Get Quote" button instead */
                        <Link
                            href="/#contact-us"
                            className="w-full h-10 px-4 py-2 text-sm font-semibold text-white bg-deep-night hover:bg-gray-700 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform active:scale-95"
                        >
                            <PhoneArrowUpRightIcon className="h-5 w-5"/>
                            Get Quote
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- PRODUCT CATALOG COMPONENT (No changes needed here) ---
const ProductCatalog = ({
    products,
    gridCols = 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
}: ProductCatalogProps) => {
    const { addToCart } = useCart();
    const { wishlistIds, addToWishlist, removeFromWishlist, isLoading: isWishlistLoading } = useWishlist();
    const { comparisonItems, toggleComparison, isInComparison, MAX_COMPARISON_ITEMS } = useComparison();
    const { data: session } = useSession();
    const router = useRouter();
    const [addedToCartId, setAddedToCartId] = useState<string | null>(null);

    const handleAddToCart = (e: React.MouseEvent, product: ProductType) => {
        e.preventDefault();
        addToCart(product);
        setAddedToCartId(product.id);
        setTimeout(() => setAddedToCartId(null), 2000);
    };

    const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
        e.preventDefault();
        if (!session) {
            router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }
        wishlistIds.includes(productId) ? removeFromWishlist(productId) : addToWishlist(productId);
    };

    const handleCompareToggle = (e: React.MouseEvent, product: ProductType) => {
        e.preventDefault();
        toggleComparison(product);
    };

    if (!products) return null;

    if (products.length === 0) {
        return <div className="text-center py-20 text-gray-500 col-span-full">No products match your current selection.</div>;
    }

    return (
        <div className={`grid grid-cols-1 gap-6 md:gap-8 ${gridCols}`}>
            {products.map((product: ProductType, index: number) => {
                const isComparing = isInComparison(product.id);
                return (
                    <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard
                            product={product}
                            inWishlist={wishlistIds.includes(product.id)}
                            isComparing={isComparing}
                            isWishlistLoading={isWishlistLoading}
                            isCompareDisabled={!isComparing && comparisonItems.length >= MAX_COMPARISON_ITEMS}
                            isAddedToCart={addedToCartId === product.id}
                            onAddToCart={(e) => handleAddToCart(e, product)}
                            onWishlistToggle={(e) => handleWishlistToggle(e, product.id)}
                            onCompareToggle={(e) => handleCompareToggle(e, product)}
                            priority={index < 4}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ProductCatalog;
