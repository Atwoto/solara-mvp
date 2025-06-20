// src/app/signup/page.tsx
'use client'; 

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormInput from "@/components/FormInput";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
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
      setError(signUpError.message);
    } else if (data.user?.identities?.length === 0) {
      setError("This email is already in use. Please try logging in.");
    } else if (data.user) {
      setSuccess("Account created successfully! Please check your email to confirm your account before logging in.");
      // Don't redirect immediately. Let the user see the success message.
      // You could redirect after a delay:
      // setTimeout(() => router.push('/login'), 5000);
    } else {
        setError("An unknown error occurred during sign-up. Please try again.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-graphite tracking-tight">Create Your Account</h1>
          <p className="mt-2 text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-solar-flare-end hover:text-solar-flare-start transition-colors">
              Log in
            </Link>
          </p>
        </div>

        {success ? (
            <div className="p-4 text-center bg-green-50 text-green-700 border border-green-200 rounded-lg">
                <h3 className="font-semibold">Success!</h3>
                <p className="text-sm mt-1">{success}</p>
                <Link href="/login" className="font-bold text-solar-flare-end hover:underline mt-4 inline-block">
                    Proceed to Login →
                </Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm text-center">{error}</div>}

              <FormInput label="Full Name" name="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name"/>
              <FormInput label="Email Address" name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
              <FormInput label="Password" name="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"/>
              <FormInput label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password"/>
              
              <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-deep-night py-3 font-semibold text-white rounded-lg hover:bg-graphite transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </div>
            </form>
        )}
      </div>
    </main>
  );
};

export default SignUpPage;