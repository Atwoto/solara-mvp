// src/app/signup/page.tsx
'use client'; 

import { useState, FormEvent } from 'react';
import Link from "next/link";
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import AuthInput from '@/components/auth/AuthInput'; // <-- Import our new input

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
        setError("You must agree to the Terms of Service and Privacy Policy.");
        return;
    }

    setIsLoading(true);
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong!');
        }
        
        // If registration is successful, automatically sign the user in
        const signInResult = await signIn('credentials', {
            redirect: false,
            email,
            password
        });
        
        if (signInResult?.error) {
            // This case is unlikely but good to handle
            setSuccess("Account created! Please proceed to login.");
        } else {
            // This is the ideal case. Account created and user is logged in.
            // NextAuth will handle the redirect via its own mechanisms if you have a callbackUrl.
            // For now, we show a success message.
            window.location.href = '/'; // Redirect to homepage on success
        }

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <AuthInput id="name" name="name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required icon={<UserIcon className="h-5 w-5 text-gray-400" />} />
          <AuthInput id="email" name="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />} />
          <AuthInput id="password" name="password" label="Create a password" type="password" value={password} onChange={e => setPassword(e.target.value)} required icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />} />
          <AuthInput id="confirmPassword" name="confirmPassword" label="Confirm your password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />} />
          
          <div className="flex items-start">
            <div className="flex h-6 items-center">
              <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-solar-flare-start focus:ring-solar-flare-end"/>
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="terms" className="text-gray-700">I agree to the <Link href="/terms" className="font-semibold text-solar-flare-end hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-solar-flare-end hover:underline">Privacy Policy</Link>.</label>
            </div>
          </div>
          
          <div>
            <button type="submit" disabled={isLoading} className="mt-2 w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.98]">
              {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-500">or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div>
            <button onClick={handleGoogleSignIn} type="button" disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-md font-semibold text-graphite hover:bg-gray-50 disabled:opacity-60">
            <FcGoogle className="h-6 w-6 mr-3" />
            Sign up with Google
            </button>
        </div>
    </div>
  );
}