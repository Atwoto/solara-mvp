'use client'; 

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormInput from "@/components/FormInput"; // Assuming this component is well-styled
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function LoginClientPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
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

    setIsCredentialsLoading(false);
    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      console.error("Credentials Sign-in error:", result.error);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl }); 
  };

  const isLoading = isCredentialsLoading || isGoogleLoading;

  return (
    // We remove the card styles from here; the parent now handles the layout.
    // This component is now purely the form content.
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-graphite tracking-tight">Welcome Back!</h1>
        <p className="mt-2 text-gray-500">
          New to Bills on Solar?{' '}
          <Link href="/signup" className="font-semibold text-solar-flare-end hover:text-solar-flare-start transition-colors duration-300">
            Create an account
          </Link>
        </p>
      </div>
      
      {/* Refined Google Sign-In Button */}
      <div className="space-y-6">
          <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-md font-semibold text-graphite hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-end transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <ArrowPathIcon className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <FcGoogle className="h-6 w-6 mr-3" />
            )}
            {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>
      </div>

      {/* Subtler "OR" divider */}
      <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm font-medium text-gray-400">Or continue with email</span>
          <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* The main form with enhanced styling */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Assuming FormInput renders a div wrapper, otherwise wrap it. */}
          {/* For best results, ensure the <input> inside FormInput has these classes: */}
          {/* className="focus:ring-solar-flare-end focus:border-solar-flare-end" */}
          <FormInput label="Email Address" name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
          <FormInput label="Password" name="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"/>

          <div className="text-right text-sm">
              <Link href="/forgot-password" className="font-semibold text-gray-500 hover:text-solar-flare-start transition-colors duration-300">
                  Forgot password?
              </Link>
          </div>

          <div>
              {/* The stunning new primary button */}
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full flex justify-center items-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 font-semibold text-white rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-end transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCredentialsLoading && <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />}
                {isCredentialsLoading ? 'Logging In...' : 'Log In'}
              </button>
          </div>
      </form>
    </div>
  );
}