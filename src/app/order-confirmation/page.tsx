import { Suspense } from 'react';
import OrderConfirmationClientPage from './OrderConfirmationClientPage';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// An improved loading skeleton for a better user experience
function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-lg max-w-lg mx-auto">
            <div className="relative h-20 w-20">
                <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse"></div>
                <CheckCircleIcon className="h-20 w-20 text-gray-300" />
            </div>
            <div className="h-8 bg-gray-200 rounded-full w-1/2 mx-auto mt-8 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded-full w-2/3 mx-auto mt-4 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded-full w-3/4 mx-auto mt-2 animate-pulse"></div>
            <div className="h-12 bg-gray-300 rounded-full w-48 mx-auto mt-8 animate-pulse"></div>
        </div>
    );
}

export default function OrderConfirmationPage() {
  return (
    <main className="bg-gray-50/70 min-h-[calc(100vh-200px)] flex items-center justify-center py-16 sm:py-24">
        <div className="container mx-auto px-4">
            <Suspense fallback={<LoadingSkeleton />}>
                <OrderConfirmationClientPage />
            </Suspense>
        </div>
    </main>
  );
}
