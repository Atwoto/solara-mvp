'use client'; 

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { FcGoogle } from "react-icons/fc"; // For the Google icon
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function LoginClientPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // This function for email/password is still perfect.
  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false, 
      email: email,
      password: password,
    });
    setIsLoading(false);
    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  // --- ADD THIS FUNCTION FOR THE GOOGLE BUTTON ---
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // This simple call tells NextAuth to handle the entire Google login flow.
    signIn('google', { callbackUrl: callbackUrl });
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-graphite tracking-tight">Welcome Back!</h1>
        <p className="mt-2 text-gray-500">
          New to Bills on Solar?{' '}
          <Link href="/signup" className="font-semibold text-solar-flare-end hover:text-solar-flare-start">
            Create an account
          </Link>
        </p>
      </div>
      
      {/* --- ADD THE GOOGLE SIGN-IN BUTTON --- */}
      <div className="space-y-6">
          <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-md font-semibold text-graphite hover:bg-gray-50 transition-all disabled:opacity-60"
          >
            <FcGoogle className="h-6 w-6 mr-3" />
            Continue with Google
          </button>
      </div>

      <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm font-medium text-gray-400">Or continue with email</span>
          <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          {/* ... your existing form inputs ... */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <div>
              <button type="submit" disabled={isLoading} className="w-full ...">
                {isLoading ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : 'Log In'}
              </button>
          </div>
      </form>
    </div>
  );
}


