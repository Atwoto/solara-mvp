// src/app/login/page.tsx
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import LoginForm from "@/components/LoginForm";
import { Suspense } from 'react';
import { SunIcon } from '@heroicons/react/24/solid'; // Import an icon

// Wrap the client component in Suspense for searchParams to work correctly
function LoginPageContent() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

export default function LoginPage() {
    return (
        // Add a container with padding and a background
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
                {/* --- THIS IS THE NEW HEADER SECTION --- */}
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

                {/* The existing form container */}
                <AuthFormContainer>
                    <LoginPageContent />
                </AuthFormContainer>
            </div>
        </div>
    );
}