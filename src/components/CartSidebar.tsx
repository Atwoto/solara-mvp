'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import NextImage from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

// --- ANIMATION VARIANTS ---
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: '0%', transition: { type: 'spring' as const, stiffness: 400, damping: 40 } },
};

const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
};

// --- ANIMATED SUBTOTAL COMPONENT ---
const AnimatedSubtotal = ({ value }: { value: number }) => {
    const motionValue = useSpring(value, {
        mass: 0.8,
        stiffness: 100,
        damping: 15,
    });
    const rounded = useTransform(motionValue, (latest) => latest.toLocaleString());

    useEffect(() => {
        motionValue.set(value);
    }, [motionValue, value]);

    return <motion.span>{rounded}</motion.span>;
};


// --- REDESIGNED CART SIDEBAR ---
const CartSidebar = () => {
    const { cartItems, removeFromCart, clearCart, updateItemQuantity, getCartTotal, isCartOpen, closeCart } = useCart();
    const subtotal = getCartTotal();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <motion.div
                    key="cart-backdrop"
                    variants={backdropVariants}
                    initial="hidden" animate="visible" exit="hidden"
                    // --- THE DEFINITIVE FIX PART 1: Set a very high z-index for the backdrop ---
                    className="fixed inset-0 z-[10000] bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={closeCart}
                >
                    <motion.div
                        key="cart-sidebar"
                        variants={sidebarVariants}
                        initial="hidden" animate="visible" exit="hidden"
                        // --- THE DEFINITIVE FIX PART 2: Set an even higher z-index for the sidebar panel itself ---
                        className="fixed top-0 right-0 z-[10001] h-full w-full max-w-lg bg-white/80 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/20"
                        onClick={(e) => e.stopPropagation()}
                        aria-modal="true" role="dialog"
                    >
                        <header className="flex items-center justify-between border-b border-gray-200/80 p-5 sticky top-0 bg-white/80 backdrop-blur-lg z-10">
                            <h2 className="text-xl font-semibold text-graphite flex items-center">
                                <ShoppingBagIcon className="h-6 w-6 mr-2.5 text-solar-flare-end" /> Your Cart
                            </h2>
                            <button onClick={closeCart} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" aria-label="Close cart">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </header>

                        <div className="flex-grow overflow-y-auto">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-6" />
                                    <p className="text-lg font-semibold text-graphite mb-2">Your Cart is Currently Empty</p>
                                    <p className="text-sm text-gray-500 mb-8 max-w-xs">Looks like you haven't added any sunshine to your cart yet!</p>
                                    <Link href="/products" onClick={closeCart} className="px-8 py-3 bg-gradient-to-r from-solar-flare-start to-solar-flare-end text-deep-night font-semibold rounded-full hover:opacity-90 transition-opacity text-sm shadow-lg">
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <motion.ul variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-gray-200/80 p-5">
                                    <AnimatePresence>
                                        {cartItems.map((item) => (
                                            <motion.li key={item.id} variants={itemVariants} exit="exit" layout className="flex items-start py-5 gap-4">
                                                <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                                                    {item.image_url && item.image_url[0] && <NextImage src={item.image_url[0]} alt={item.name} fill className="object-cover" sizes="80px" />}
                                                </div>
                                                <div className="flex-grow">
                                                    <Link href={`/products/${item.id}`} onClick={closeCart} className="text-sm font-medium text-graphite hover:text-solar-flare-start line-clamp-2">{item.name}</Link>
                                                    <p className="text-sm text-gray-500 mt-1">Ksh {item.price.toLocaleString()}</p>
                                                    <div className="flex items-center mt-3">
                                                        <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="p-1.5 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50" aria-label="Decrease quantity"><MinusIcon className="h-4 w-4" /></button>
                                                        <span className="px-4 py-1 text-sm font-medium text-gray-700">{item.quantity}</span>
                                                        <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-1.5 border rounded-md text-gray-600 hover:bg-gray-100" aria-label="Increase quantity"><PlusIcon className="h-4 w-4" /></button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end ml-4">
                                                    <p className="font-semibold text-sm text-graphite whitespace-nowrap">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                                                    <button onClick={() => removeFromCart(item.id)} className="mt-2 p-1 text-xs text-gray-500 hover:text-red-500 transition-colors" title="Remove item"><TrashIcon className="h-4 w-4" /></button>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </motion.ul>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <footer className="border-t border-gray-200/80 p-5 bg-white/80 backdrop-blur-lg sticky bottom-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                                <div className="flex justify-between font-semibold text-md text-graphite mb-1.5">
                                    <span>Subtotal</span>
                                    <span>Ksh <AnimatedSubtotal value={subtotal} /></span>
                                </div>
                                <p className="text-xs text-gray-500 mb-5">Shipping and taxes calculated at checkout.</p>

                                <Link href="/checkout" onClick={closeCart} className="block w-full text-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3.5 text-base font-semibold text-deep-night rounded-lg shadow-lg hover:opacity-95 transition-all transform hover:scale-[1.01] active:scale-95">
                                    Proceed to Checkout
                                </Link>
                                <button onClick={clearCart} className="w-full text-center text-xs text-gray-500 hover:text-red-500 mt-3 transition-colors">Clear Cart</button>
                            </footer>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
