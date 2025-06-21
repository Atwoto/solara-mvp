'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function OrderConfirmationClientPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <>
      <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-4xl font-bold text-green-600">Thank You!</h1>
      <p className="mt-4 text-lg text-gray-800">Your order has been placed successfully.</p>
      
      {orderId ? (
        <p className="mt-2 text-gray-600">
          Your Order ID is:{' '}
          <span className="font-mono bg-gray-100 text-deep-night p-1 rounded-md">{orderId}</span>
        </p>
      ) : (
        <p className="mt-2 text-gray-600">Please check your email for the order details.</p>
      )}

      <Link 
        href="/products" 
        className="mt-8 inline-block bg-deep-night text-white px-8 py-3 rounded-lg shadow-md hover:bg-graphite transition-colors"
      >
        Continue Shopping
      </Link>
    </>
  );
}