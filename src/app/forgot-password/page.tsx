// src/app/forgot-password/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import FormInput from '@/components/FormInput';
import { ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/update-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess("If an account with that email exists, we've sent a password reset link. Please check your inbox and spam folder.");
    }
  };

  return (
    // Reusing the same split-screen layout for 100% consistency
    <main className="min-h-screen w-full bg-cloud-white lg:grid lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col items-center justify-center p-12 text-white bg-gradient-to-br from-graphite to-deep-night">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2940&auto=format&fit=crop')" }}
            ></div>
            <div className="relative z-10 text-center">
                <div className="mb-8">
                    <svg className="h-12 w-auto mx-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6L36.9526 13.5V28.5L24 36L11.0474 28.5V13.5L24 6Z" stroke="#FDB813" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 42L36.9526 34.5V19.5L24 27L11.0474 19.5V34.5L24 42Z" stroke="#FDB813" stroke-opacity="0.6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Bills On Solar</h1>
                </div>
                <h2 className="text-4xl font-bold">A little hiccup?</h2>
                <p className="mt-4 text-lg max-w-md mx-auto text-gray-300">
                    Don't worry, we'll help you get back into your account in no time.
                </p>
            </div>
        </div>
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
              {success ? (
                <div className="text-center p-8">
                  <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                  <h2 className="mt-4 text-3xl font-bold text-graphite">Check Your Email</h2>
                  <p className="mt-2 text-gray-600">{success}</p>
                  <div className="mt-8">
                    <Link 
                      href="/login" 
                      className="inline-block w-full bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 px-6 font-semibold text-white rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-300"
                    >
                        Back to Login
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-graphite tracking-tight">Forgot Password</h1>
                    <p className="mt-2 text-gray-500">
                      Enter your email and we'll send you a reset link.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                        <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <FormInput label="Email Address" name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
                    <div>
                      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 font-semibold text-white rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-end transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading && <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />}
                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                      </button>
                    </div>
                    <div className="text-center text-sm font-semibold">
                      <Link href="/login" className="text-gray-500 hover:text-solar-flare-start transition-colors duration-300">
                        ← Back to Login
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </div>
        </div>
    </main>
  );
};