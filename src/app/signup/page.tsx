import { Suspense } from 'react';
import SignUpClientPage from './SignUpClientPage';

// We'll update the skeleton to better reflect the new form's structure.
function LoadingFormSkeleton() {
    return (
        <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-2xl animate-pulse">
            <div className="text-center space-y-3">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="space-y-6 mt-10">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded-lg mt-8"></div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
  return (
    // Reusing the exact same layout structure for perfect consistency.
    <main className="min-h-screen w-full bg-cloud-white lg:grid lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col items-center justify-center p-12 text-white bg-gradient-to-br from-graphite to-deep-night">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2940&auto=format&fit=crop')" }}
            ></div>
            <div className="relative z-10 text-center">
                {/* Your consistent brand panel */}
                <div className="mb-8">
                    <svg className="h-12 w-auto mx-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6L36.9526 13.5V28.5L24 36L11.0474 28.5V13.5L24 6Z" stroke="#FDB813" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 42L36.9526 34.5V19.5L24 27L11.0474 19.5V34.5L24 42Z" stroke="#FDB813" stroke-opacity="0.6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Bills On Solar</h1>
                </div>
                <h2 className="text-4xl font-bold">Power Your Future.</h2>
                <p className="mt-4 text-lg max-w-md mx-auto text-gray-300">
                    Join the renewable energy revolution and gain full control over your power consumption and billing.
                </p>
            </div>
        </div>
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
             <Suspense fallback={<LoadingFormSkeleton />}>
                <SignUpClientPage />
            </Suspense>
        </div>
    </main>
  );
}