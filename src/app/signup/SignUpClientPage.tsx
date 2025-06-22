'use client'; 

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from "@/components/FormInput";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignUpClientPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

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

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setIsLoading(false);

    if (signUpError) {
      // Improve Supabase's default error message for better UX
      if (signUpError.message.includes("User already registered")) {
        setError("This email is already in use. Please try logging in.");
      } else {
        setError(signUpError.message);
      }
    } else if (data.user) {
      setSuccess("Please check your email to confirm your account before logging in.");
    } else {
        setError("An unknown error occurred. Please try again.");
    }
  };

  return (
    // The main container for the form content. No card styles needed.
    <div className="w-full max-w-md space-y-8">
      {success ? (
          // A more celebratory and clear success state
          <div className="text-center p-8">
              <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="mt-4 text-3xl font-bold text-graphite">Account Created!</h2>
              <p className="mt-2 text-gray-600">{success}</p>
              <div className="mt-8">
                <Link 
                  href="/login" 
                  className="inline-block w-full bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 px-6 font-semibold text-white rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-300"
                >
                    Proceed to Login
                </Link>
              </div>
          </div>
      ) : (
          <>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-graphite tracking-tight">Create Your Account</h1>
              <p className="mt-2 text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-solar-flare-end hover:text-solar-flare-start transition-colors duration-300">
                  Log in here
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                  <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Ensure FormInput's inner <input> has classes like: */}
              {/* "focus:ring-solar-flare-end focus:border-solar-flare-end" for a consistent look */}
              <FormInput label="Full Name" name="name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name"/>
              <FormInput label="Email Address" name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
              <FormInput label="Password" name="password" type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"/>
              <FormInput label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"/>
              
              <div>
                {/* The stunning new primary button, matching the login page */}
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full flex justify-center items-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3 font-semibold text-white rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-end transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading && <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />}
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </>
      )}
    </div>
  );
}