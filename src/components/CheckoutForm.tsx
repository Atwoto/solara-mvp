'use client';

import { useState, useEffect, FormEvent, ChangeEvent, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from "@/context/CartContext";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, ExclamationTriangleIcon, ShoppingBagIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, TruckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import GuestCheckoutModal from './GuestCheckoutModal';

declare global {
    interface Window {
        PaystackPop?: {
            setup: (options: any) => {
                openIframe: () => void;
            };
        };
    }
}

const FormInput = ({ id, name, type = 'text', value, onChange, placeholder, icon, required = false, readOnly = false }: {
    id: string;
    name: string;
    type?: string;
    value: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon: ReactNode;
    required?: boolean;
    readOnly?: boolean;
}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {placeholder} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                {icon}
            </div>
            <input
                type={type}
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                className={`block w-full rounded-lg border-gray-300 shadow-sm p-3 pl-10 focus:border-solar-flare-start focus:ring-solar-flare-start sm:text-sm transition-colors ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default function CheckoutForm() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cartItems, clearCart, isLoading: isCartLoading } = useCart();

    const [formData, setFormData] = useState({ fullName: '', phone: '', address: '', guestEmail: '' });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [formError, setFormError] = useState('');
    const [showGuestModal, setShowGuestModal] = useState(false);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = 0; 
    const total = subtotal + shippingCost;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            // Show guest checkout modal instead of redirecting
            setShowGuestModal(true);
        } else if (session?.user?.name) {
            setFormData(prev => ({ ...prev, fullName: session.user.name! }));
        }
    }, [status, router, session]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePayment = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
            setFormError('Please fill in all required shipping fields.');
            return;
        }
        setIsProcessingPayment(true);
        setFormError('');

        try {
            // Determine user email - either from session or from guest checkout
            const userEmail = session?.user?.email || formData.guestEmail;
            
            const checkoutResponse = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems,
                    shippingDetails: { ...formData, email: userEmail },
                    subtotal,
                    shippingCost: "To be calculated",
                    total,
                    isGuestCheckout: !session, // Flag to indicate guest checkout
                }),
            });
            const checkoutData = await checkoutResponse.json();
            if (!checkoutResponse.ok) throw new Error(checkoutData.error || 'Failed to create order.');

            if (!window.PaystackPop) throw new Error("Paystack JS not loaded.");

            const handler = window.PaystackPop.setup({
                key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
                email: userEmail!,
                amount: Math.round(total * 100),
                currency: 'KES',
                ref: checkoutData.paystack.reference,
                onClose: () => {
                    setFormError('Payment popup closed. Your order is pending payment.');
                    setIsProcessingPayment(false);
                    router.push(`/order-confirmation?orderId=${checkoutData.orderId}`);
                },
                callback: (response: any) => {
                    clearCart();
                    router.push(`/order-confirmation?orderId=${checkoutData.orderId}&ref=${response.reference}`);
                }
            });
            handler.openIframe();
        } catch (err: any) {
            setFormError(err.message || 'An unexpected error occurred.');
            setIsProcessingPayment(false);
        }
    };

    if (status === 'loading' || isCartLoading) {
        return <div className="flex h-screen items-center justify-center"><p className="text-lg text-gray-600">Loading your secure checkout...</p></div>;
    }

    if (cartItems.length === 0 && !isProcessingPayment) {
        return (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg container mx-auto mt-12">
                <ShoppingBagIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-graphite mb-3">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-8">Add some amazing solar products to get started!</p>
                <Link href="/products" className="inline-block px-8 py-3 text-base font-semibold text-deep-night bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <form onSubmit={handlePayment}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200/80"
                        >
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <h2 className="text-2xl font-semibold text-graphite">Shipping Information</h2>
                                {!session && (
                                    <button
                                        type="button"
                                        onClick={() => setShowGuestModal(true)}
                                        className="flex items-center text-sm font-medium text-solar-flare-start hover:text-solar-flare-end transition-colors"
                                    >
                                        <UserCircleIcon className="h-5 w-5 mr-1" />
                                        Guest Checkout
                                    </button>
                                )}
                            </div>
                            <div className="space-y-6">
                                <FormInput id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" icon={<UserIcon className="h-5 w-5 text-gray-400" />} required />
                                <FormInput id="email" name="email" type="email" value={session?.user?.email || formData.guestEmail || ''} placeholder="Email Address" icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />} readOnly={!session} />
                                <FormInput id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" icon={<PhoneIcon className="h-5 w-5 text-gray-400" />} required />
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 top-0 flex items-center pl-3.5 pt-3.5"><MapPinIcon className="h-5 w-5 text-gray-400" /></div>
                                        <textarea name="address" id="address" value={formData.address} onChange={handleInputChange} rows={3} className="block w-full rounded-lg border-gray-300 shadow-sm p-3 pl-10 focus:border-solar-flare-start focus:ring-solar-flare-start sm:text-sm transition-colors" required placeholder="Street address, apartment, etc." />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                            className="lg:col-span-1"
                        >
                            <div className="rounded-2xl border bg-white p-6 shadow-lg sticky top-28">
                                <h2 className="text-xl sm:text-2xl font-semibold text-graphite mb-6 pb-4 border-b">Your Order</h2>
                                <div className="space-y-4 max-h-72 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-16 w-16 rounded-md border bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {item.image_url && item.image_url[0] && <img src={item.image_url[0]} alt={item.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-graphite block line-clamp-1">{item.name}</span>
                                                    <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <span className="font-medium text-graphite whitespace-nowrap">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="py-4 border-t border-b space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Ksh {subtotal.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-medium text-right">Calculated after checkout</span></div>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-graphite pt-4 pb-5">
                                    <span>Order Total</span>
                                    <span>Ksh {total.toLocaleString()}</span>
                                </div>
                                
                                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-start gap-2.5 mb-5 border border-blue-200">
                                    <TruckIcon className="h-5 w-5 flex-shrink-0 mt-0.5"/>
                                    {/* --- THIS IS THE FIX --- */}
                                    <span>All shipping and delivery costs will be communicated after your order is placed.</span>
                                </div>
                                
                                <AnimatePresence>
                                {formError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="flex items-start p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200 overflow-hidden"
                                    >
                                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                        <span>{formError}</span>
                                    </motion.div>
                                )}
                                </AnimatePresence>

                                <button type="submit" disabled={isProcessingPayment || cartItems.length === 0} className="w-full flex items-center justify-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 px-4 text-base font-semibold text-deep-night rounded-lg shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                                    {isProcessingPayment ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <><LockClosedIcon className="h-5 w-5 mr-2" /> Proceed to Payment</>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 mt-3 text-center">You will be redirected to Paystack to complete your payment securely.</p>
                            </div>
                        </motion.div>
                    </div>
                </form>
                
                {/* Guest Checkout Modal */}
                <GuestCheckoutModal 
                    isOpen={showGuestModal}
                    onClose={() => setShowGuestModal(false)}
                    onGuestContinue={(email) => {
                        setFormData(prev => ({ ...prev, guestEmail: email }));
                        setShowGuestModal(false);
                    }}
                    onSignInSuccess={() => {
                        // Refresh the page to update session state
                        window.location.reload();
                    }}
                />
            </div>
        </main>
    );
}
