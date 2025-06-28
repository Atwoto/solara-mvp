// /src/components/CheckoutForm.tsx
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from "@/context/CartContext";
import Link from 'next/link';
import NextImage from 'next/image';
import { LockClosedIcon, ExclamationTriangleIcon, ShoppingBagIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

declare global {
    interface Window {
        PaystackPop?: {
            setup: (options: any) => {
                openIframe: () => void;
            };
        };
    }
}

export default function CheckoutForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, clearCart, isLoading: isCartLoading } = useCart(); 

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formError, setFormError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 ? 500 : 0; 
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
      router.push('/login?callbackUrl=/checkout');
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
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cartItems,
            shippingDetails: { ...formData, email: session?.user?.email },
            subtotal,
            shippingCost,
            total,
        }),
      });
      
      const checkoutData = await checkoutResponse.json();
      if (!checkoutResponse.ok) throw new Error(checkoutData.error || 'Failed to create order.');
      
      const paystackData = checkoutData.paystack;

      if (!window.PaystackPop) throw new Error("Paystack JS not loaded.");

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: session!.user!.email!,
        amount: Math.round(total * 100),
        currency: 'KES',
        ref: paystackData.reference,
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
            <ShoppingBagIcon className="h-20 w-20 text-gray-300 mx-auto mb-6"/>
            <h2 className="text-2xl font-semibold text-graphite mb-3">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some amazing solar products to get started!</p>
            <Link href="/products" className="inline-block px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-105">
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
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-graphite mb-6 border-b pb-4">Shipping Information</h2>
              <div className="space-y-6">
                 <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label><div className="relative mt-1"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-gray-400" /></div><input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm p-3 pl-10 focus:border-solar-flare-start focus:ring-solar-flare-start sm:text-sm" required /></div></div>
                 <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><div className="relative mt-1"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><EnvelopeIcon className="h-5 w-5 text-gray-400" /></div><input type="email" id="email" value={session?.user?.email || ''} className="block w-full rounded-md border-gray-300 shadow-sm p-3 pl-10 bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm" readOnly /></div></div>
                 <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label><div className="relative mt-1"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon className="h-5 w-5 text-gray-400" /></div><input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm p-3 pl-10 focus:border-solar-flare-start focus:ring-solar-flare-start sm:text-sm" required placeholder="+254 7XX XXX XXX"/></div></div>
                 <div><label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address <span className="text-red-500">*</span></label><div className="relative mt-1"><div className="pointer-events-none absolute inset-y-0 left-0 top-0 flex items-center pl-3 pt-3"><MapPinIcon className="h-5 w-5 text-gray-400" /></div><textarea name="address" id="address" value={formData.address} onChange={handleInputChange} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm p-3 pl-10 focus:border-solar-flare-start focus:ring-solar-flare-start sm:text-sm" required placeholder="Street address, Apartment, etc."></textarea></div></div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
                <div className="rounded-xl border bg-white p-6 shadow-lg sticky top-28">
                    <h2 className="text-xl sm:text-2xl font-semibold text-graphite mb-6 pb-4 border-b">Your Order</h2>
                     <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"> 
                       {cartItems.map(item => ( 
                         <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                               {/* *** THIS IS THE FIX: Use the first image from the array *** */}
                               <div className="relative h-14 w-14 rounded border bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
                                   {item.image_url && item.image_url[0] ? (
                                       <NextImage src={item.image_url[0]} alt={item.name} fill className="object-cover"/>
                                   ) : <div className="w-full h-full bg-gray-200"></div>}
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
                     <div className="py-4 border-t border-b border-gray-200 space-y-1.5 text-sm"> <div className="flex justify-between text-gray-600"> <span>Subtotal</span> <span>Ksh {subtotal.toLocaleString()}</span> </div> <div className="flex justify-between text-gray-600"> <span>Shipping</span> <span>Ksh {shippingCost.toLocaleString()}</span> </div> </div>
                     <div className="flex justify-between text-lg font-bold text-graphite pt-4 pb-5"> <span>Total</span> <span>Ksh {total.toLocaleString()}</span> </div>

                    {formError && <div className="flex items-start p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200"> <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0"/> <span>{formError}</span> </div> }
                    <button type="submit" disabled={isProcessingPayment || cartItems.length === 0} className="w-full flex items-center justify-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 px-4 text-base font-semibold text-white rounded-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" >
                        {isProcessingPayment ? ( 'Processing...' ) : ( <><LockClosedIcon className="h-5 w-5 mr-2" /> Proceed to Payment</> )}
                    </button>
                    <p className="text-xs text-gray-500 mt-3 text-center">You will be redirected to Paystack to complete your payment securely.</p>
                </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}