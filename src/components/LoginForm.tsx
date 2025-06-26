// /src/components/LoginForm.tsx -- THIS IS A NEW FILE
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// All the logic from your original login page lives here now.
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  // This is the hook that was causing the build error
  const searchParams = useSearchParams(); 
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const authError = searchParams.get('error');

  useEffect(() => {
    if (authError) {
      setError('Authentication failed. Please try again.');
    }
  }, [authError]);

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false, 
      email: email,
      password: password,
    });
    setIsLoading(false);
    if (result?.error) {
      setError('Invalid email or password.');
    } else if (result?.ok) {
      router.push(callbackUrl);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl: callbackUrl });
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-graphite tracking-tight">Welcome Back!</h1>
        <p className="mt-2 text-gray-500">
          New here?{' '}
          <Link href="/signup" className="font-semibold text-solar-flare-end hover:text-solar-flare-start">
            Create an account
          </Link>
        </p>
      </div>
      
      <div className="space-y-6">
        <button onClick={handleGoogleSignIn} type="button" disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-md font-semibold text-graphite hover:bg-gray-50 disabled:opacity-60">
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
        {error && (
          <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div>
          <label htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Log In'}
          </button>
        </div>
      </form>
    </div>
  );
}