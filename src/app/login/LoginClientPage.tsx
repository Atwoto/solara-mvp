'use client'; 

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function LoginClientPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // This calls the 'authorize' function in your auth.ts
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
      router.refresh(); // Refresh to update server components like the header
    } else {
      setError('An unknown error occurred. Please try again.');
    }
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

      <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm font-medium text-gray-400">Or continue with email</span>
          <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-solar-flare-end focus:ring-solar-flare-end"/>
          </div>
          <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-solar-flare-end focus:ring-solar-flare-end"/>
          </div>
          <div className="text-right text-sm">
              <Link href="/forgot-password" className="font-semibold text-gray-500 hover:text-solar-flare-start">Forgot password?</Link>
          </div>
          <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 font-semibold text-white rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-60">
                {isLoading ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : 'Log In'}
              </button>
          </div>
      </form>
    </div>
  );
}