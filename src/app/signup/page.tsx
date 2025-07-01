// src/app/signup/page.tsx
'use client'; 

import { useState, FormEvent, useEffect } from 'react'; // <-- Import useEffect
import Link from "next/link";
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { 
    ArrowPathIcon, ExclamationCircleIcon, UserIcon, EnvelopeIcon, 
    LockClosedIcon, SunIcon, CheckCircleIcon 
} from '@heroicons/react/24/solid';
import AuthInput from '@/components/auth/AuthInput';
import AuthFormContainer from '@/components/auth/AuthFormContainer';

// BackgroundElements component remains the same...
const BackgroundElements = () => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-white via-yellow-50/50 to-orange-100/30">
        <div className="absolute top-[10%] left-[5%] w-1/3 text-gray-200/80"><p className="text-xs uppercase font-bold">New Energy For Our System</p><h2 className="text-5xl font-extrabold text-gray-300/50">Clean Renewable</h2><h2 className="text-5xl font-extrabold text-gray-200/80 -mt-2">Limitless Energy</h2><div className="mt-4 h-10 w-48 bg-gray-200/60 rounded-full"></div></div>
        <div className="absolute bottom-[15%] left-[10%] w-1/4 text-gray-200/80"><p className="text-xs uppercase font-bold">// BENEFITS</p><h2 className="text-3xl font-extrabold text-gray-300/50">The Benefits Of</h2><h2 className="text-3xl font-extrabold text-gray-200/80 -mt-1">Going Solar With Us</h2></div>
        <div className="absolute top-[20%] right-[8%] w-1/4 text-gray-200/80 p-6 bg-white/20 rounded-2xl border border-gray-200/50"><h3 className="text-2xl font-bold text-gray-300/80">Switching To Solar</h3><p className="text-lg font-bold text-gray-200/60">In 3 Easy Steps</p><div className="mt-4 h-32 bg-gray-200/40 rounded-lg"></div></div>
        <SunIcon className="absolute h-40 w-40 text-yellow-200/30 top-10 right-1/4 animate-float" style={{ animationDelay: '-1s' }} />
        <SunIcon className="absolute h-24 w-24 text-yellow-200/20 bottom-10 left-1/3 animate-float" style={{ animationDelay: '-3s' }} />
    </div>
);


export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  // --- NEW: Separate state for password confirmation error ---
  const [passwordMatchError, setPasswordMatchError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW: useEffect for live password validation ---
  useEffect(() => {
    // Only show the error if the user has started typing in the confirm password field
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMatchError("Passwords do not match.");
    } else {
      // Clear the error if they match or if the field is empty
      setPasswordMatchError(null);
    }
  }, [password, confirmPassword]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final check on submit
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // ... other validation checks remain the same
    if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }
    if (!agreedToTerms) {
        setError("You must agree to the Terms of Service and Privacy Policy.");
        return;
    }
    
    setIsLoading(true);
    // ... rest of handleSubmit logic is unchanged
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        const signInResult = await signIn('credentials', { redirect: false, email, password });
        if (signInResult?.error) window.location.href = '/login';
        else window.location.href = '/';
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => signIn('google', { callbackUrl: '/' });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <BackgroundElements />
        <div className="relative z-10 flex flex-col items-center w-full">
            <div className="mb-8 text-center">
                <div className="inline-block p-4 bg-gradient-to-br from-solar-flare-start to-orange-400 rounded-full shadow-lg mb-4">
                    <SunIcon className="h-8 w-8 text-white"/>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-deep-night">Solar Panel Bills</h1>
                <p className="mt-2 text-lg text-gray-500">Manage your solar energy efficiently</p>
            </div>
            <AuthFormContainer>
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
                      
                      {/* --- UPDATED: Confirmation Password Field --- */}
                      <div>
                        <AuthInput id="confirmPassword" name="confirmPassword" label="Confirm your password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />} />
                        {/* Live feedback message */}
                        {passwordMatchError ? (
                            <p className="mt-2 text-xs text-red-600 flex items-center">
                                <ExclamationCircleIcon className="h-4 w-4 mr-1"/>
                                {passwordMatchError}
                            </p>
                        ) : (confirmPassword && !passwordMatchError) ? (
                            <p className="mt-2 text-xs text-green-600 flex items-center">
                                <CheckCircleIcon className="h-4 w-4 mr-1"/>
                                Passwords match!
                            </p>
                        ) : null}
                      </div>

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
                        <div className="flex-grow border-t border-gray-200"></div><span className="flex-shrink mx-4 text-sm text-gray-500">or continue with</span><div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div>
                        <button onClick={handleGoogleSignIn} type="button" disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-md font-semibold text-graphite hover:bg-gray-50 disabled:opacity-60">
                          <FcGoogle className="h-6 w-6 mr-3" />
                          Sign up with Google
                        </button>
                    </div>
                </div>
            </AuthFormContainer>
        </div>
    </div>
  );
}