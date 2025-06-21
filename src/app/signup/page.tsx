import { Suspense } from 'react';
import SignUpClientPage from './SignUpClientPage';

// A simple loading skeleton to show while the dynamic form loads.
function LoadingFormSkeleton() {
    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg animate-pulse">
            <div className="text-center space-y-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="space-y-5 mt-10">
                <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
                 <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded-lg mt-8"></div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
        <Suspense fallback={<LoadingFormSkeleton />}>
            <SignUpClientPage />
        </Suspense>
    </main>
  );
}