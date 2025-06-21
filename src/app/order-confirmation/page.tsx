import { Suspense } from 'react';
import OrderConfirmationClientPage from './OrderConfirmationClientPage';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// A simple loading skeleton to display while the dynamic content is loading.
function LoadingSkeleton() {
    return (
        <>
            <ArrowPathIcon className="h-20 w-20 text-gray-300 mx-auto mb-6 animate-spin" />
            <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mt-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mt-2 animate-pulse"></div>
            <div className="h-12 bg-gray-300 rounded-lg w-48 mx-auto mt-8 animate-pulse"></div>
        </>
    );
}

export default function OrderConfirmationPage() {
  return (
    <main className="container mx-auto px-4 py-24 text-center">
      <Suspense fallback={<LoadingSkeleton />}>
        <OrderConfirmationClientPage />
      </Suspense>
    </main>
  );
}