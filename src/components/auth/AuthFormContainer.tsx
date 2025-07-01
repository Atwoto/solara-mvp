// src/components/auth/AuthFormContainer.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function AuthFormContainer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname.includes('/login');
  
  return (
    // --- THIS IS THE FIX ---
    // Removed the vertical margin `my-16` to prevent double-spacing.
    // The parent page's padding will now control the vertical position.
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-deep-night tracking-tight">
          {isLoginPage ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="mt-2 text-gray-500">
          {isLoginPage ? "Sign in to your account or create a new one" : "Fill in your details to get started"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-8">
        <Link href="/login" className={`block w-full text-center px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${isLoginPage ? 'bg-white shadow text-solar-flare-end' : 'text-gray-500 hover:bg-gray-200/50'}`}>
          Sign In
        </Link>
        <Link href="/signup" className={`block w-full text-center px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${!isLoginPage ? 'bg-white shadow text-solar-flare-end' : 'text-gray-500 hover:bg-gray-200/50'}`}>
          Sign Up
        </Link>
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}