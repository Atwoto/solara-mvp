'use client'; 

import { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const authError = searchParams.get('error');

  // Handle any authentication errors passed back in the URL
  useEffect(() => {
    if (authError) {
      // This switch can be expanded with more specific error messages
      switch (authError.toLowerCase()) {
        case 'accessdenied':
          setError('Access was denied. Please try again or use a different method.');
          break;
        case 'configuration':
        case 'oauthaccountnotlinked':
          setError('There was a configuration error. Please contact support.');
          break;
        default:
          setError('An authentication error occurred. Please try again.');
      }
      // Clear the URL of the error parameter for a cleaner user experience
      router.replace('/login');
    }
  }, [authError, router]);

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
      router.refresh(); // Refresh server components to reflect login state
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setIsLoading(true);
    // This simple call triggers the entire Google OAuth flow handled by NextAuth
    signIn('google', { 
      callbackUrl: callbackUrl,
      // The redirect is handled by NextAuth, so we don't need to wrap this in a try/catch
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Welcome Back!</h1>
          <p className="mt-2 text-gray-500">
            New here?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-500">
              Create an account
            </Link>
          </p>
        </div>
        
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-md font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <ArrowPathIcon className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <FcGoogle className="h-6 w-6 mr-3" />
            )}
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your password"
            />
          </div>
          
          <div className="text-right text-sm">
            <Link href="/forgot-password" className="font-semibold text-gray-500 hover:text-blue-600">
              Forgot password?
            </Link>
          </div>
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Logging In...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}