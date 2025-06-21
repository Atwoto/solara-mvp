import { Suspense } from 'react';
import LoginClientPage from './LoginClientPage';

// This is a simple loading skeleton that will be shown while the dynamic form loads.
function LoadingFormSkeleton() {
    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg animate-pulse">
            <div className="text-center space-y-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg"></div>
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-300">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <div className="space-y-5">
                <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded-lg mt-10"></div>
            </div>
        </div>
    );
}

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
        <Suspense fallback={<LoadingFormSkeleton />}>
            <LoginClientPage />
        </Suspense>
    </main>
  );
}