// src/app/login/page.tsx
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import LoginForm from "@/components/LoginForm";
import { Suspense } from 'react';
import { SunIcon } from '@heroicons/react/24/solid';

function LoginPageContent() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

const FloatingIcon = ({ className, delay }: { className: string, delay?: string }) => (
    <div className={`absolute -z-10 text-yellow-300/30 animate-float ${className}`} style={{ animationDelay: delay }}>
        <SunIcon />
    </div>
);

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-50">
            
            {/* --- Background Image Layer --- */}
            <div 
                className="absolute inset-0 -z-20" // Place it behind everything
                style={{
                    backgroundImage: `url('/images/solar-bg.jpg')`, // <-- MAKE SURE THIS PATH IS CORRECT
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Add an overlay directly on the background for tinting */}
                <div className="absolute inset-0 bg-black/10"></div> 
            </div>

            {/* --- Floating Icons Layer (no change here) --- */}
            <FloatingIcon className="h-48 w-48 top-20 -left-20" />
            <FloatingIcon className="h-24 w-24 top-1/3 right-10" delay="-2s" />
            <FloatingIcon className="h-32 w-32 bottom-10 -right-16" delay="-4s" />
            <FloatingIcon className="h-20 w-20 bottom-1/4 left-5" delay="-1s" />
            <FloatingIcon className="h-16 w-16 top-3/4 -left-8" delay="-3s" />
            
            {/* The main content remains the same */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 bg-gradient-to-br from-solar-flare-start to-orange-400 rounded-full shadow-lg mb-4">
                        <SunIcon className="h-8 w-8 text-white"/>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-deep-night">
                        Solar Panel Bills
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Manage your solar energy efficiently
                    </p>
                </div>
                <AuthFormContainer>
                    <LoginPageContent />
                </AuthFormContainer>
            </div>
        </div>
    );
}