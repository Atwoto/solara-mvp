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

// A new component for the background elements to keep the main component clean
const BackgroundElements = () => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-white via-yellow-50/50 to-orange-100/30">
        {/* Faint text block 1 */}
        <div className="absolute top-[10%] left-[5%] w-1/3 text-gray-200/80">
            <p className="text-xs uppercase font-bold">New Energy For Our System</p>
            <h2 className="text-5xl font-extrabold text-gray-300/50">Clean Renewable</h2>
            <h2 className="text-5xl font-extrabold text-gray-200/80 -mt-2">Limitless Energy</h2>
            <div className="mt-4 h-10 w-48 bg-gray-200/60 rounded-full"></div>
        </div>
        
        {/* Faint text block 2 */}
        <div className="absolute bottom-[15%] left-[10%] w-1/4 text-gray-200/80">
            <p className="text-xs uppercase font-bold">// BENEFITS</p>
            <h2 className="text-3xl font-extrabold text-gray-300/50">The Benefits Of</h2>
            <h2 className="text-3xl font-extrabold text-gray-200/80 -mt-1">Going Solar With Us</h2>
        </div>

        {/* Faint card block */}
        <div className="absolute top-[20%] right-[8%] w-1/4 text-gray-200/80 p-6 bg-white/20 rounded-2xl border border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-300/80">Switching To Solar</h3>
            <p className="text-lg font-bold text-gray-200/60">In 3 Easy Steps</p>
            <div className="mt-4 h-32 bg-gray-200/40 rounded-lg"></div>
        </div>

         {/* Faint Floating Sun Icons */}
        <SunIcon className="absolute h-40 w-40 text-yellow-200/30 top-10 right-1/4 animate-float" style={{ animationDelay: '-1s' }} />
        <SunIcon className="absolute h-24 w-24 text-yellow-200/20 bottom-10 left-1/3 animate-float" style={{ animationDelay: '-3s' }} />
    </div>
);


export default function LoginPage() {
    return (
        // The main container is now simpler
        <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            
            <BackgroundElements />
            
            {/* The main content is placed on top with a higher z-index */}
            <div className="relative z-10 flex flex-col items-center w-full">
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