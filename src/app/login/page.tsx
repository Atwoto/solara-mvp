// src/app/login/page.tsx
'use client'; 

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormInput from "@/components/FormInput";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc"; // For the Google logo
import { ArrowPathIcon } from '@heroicons/react/24/solid'; // For loading spinner

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Separate loading states for different actions
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCredentialsLoading(true);

    const result = await signIn('credentials', {
      redirect: false, 
      email: email,
      password: password,
    });

    if (result?.error) {
      // The 'CredentialsSignin' error code is generic for bad credentials.
      setError('Invalid email or password. Please try again.');
      console.error("Credentials Sign-in error:", result.error);
      setIsCredentialsLoading(false); // Stop loading on error
    } else {
      // On success, NextAuth's internal redirect handling is often sufficient,
      // but router.push provides an explicit redirect.
      router.push(callbackUrl);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true); // Show loading state for the Google button
    // The redirect will happen, so we don't need to set it back to false
    signIn('google', { callbackUrl }); 
  };

  const isLoading = isCredentialsLoading || isGoogleLoading;

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-graphite tracking-tight">Log in to Your Account</h1>
          <p className="mt-2 text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-solar-flare-end hover:text-solar-flare-start transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* --- GOOGLE SIGN IN BUTTON --- */}
        <div className="space-y-4">
            <button
                onClick={handleGoogleSignIn}
                type="button"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <FcGoogle className="h-5 w-5 mr-2" />
              )}
              {isGoogleLoading ? 'Redirecting...' : 'Sign in with Google'}
            </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm text-center">{error}</div>}

            <FormInput label="Email Address" name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
            <FormInput label="Password" name="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"/>

            <div className="text-right text-sm">
                <Link href="/forgot-password" className="font-medium text-gray-500 hover:text-solar-flare-start">
                    Forgot password?
                </Link>
            </div>

            <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center bg-deep-night py-3 font-semibold text-white rounded-lg hover:bg-graphite transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isCredentialsLoading && <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />}
                  {isCredentialsLoading ? 'Logging In...' : 'Log In with Email'}
                </button>
            </div>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;