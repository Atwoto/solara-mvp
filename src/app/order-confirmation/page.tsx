// src/app/order-confirmation/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const OrderConfirmationPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <main className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-green-600">Thank You!</h1>
      <p className="mt-4 text-lg">Your order has been placed successfully.</p>
      <p className="mt-2 text-gray-600">Your Order ID is: <span className="font-mono bg-gray-100 p-1 rounded">{orderId}</span></p>
      <Link href="/products" className="mt-8 inline-block bg-deep-night text-white px-6 py-3 rounded-lg">
        Continue Shopping
      </Link>
    </main>
  );
};

export default OrderConfirmationPage;