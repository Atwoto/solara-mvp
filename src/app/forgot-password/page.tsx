// src/app/forgot-password/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import FormInput from '@/components/FormInput'; // Your reusable form input
import PageHeader from '@/components/PageHeader'; // Your public page header

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // This is the URL Supabase will send in the email.
    // It must point to the page where users can set their new password.
    // Ensure this matches your production URL when deploying.
    const redirectUrl = `${window.location.origin}/update-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess("If an account with that email exists, we've sent a password reset link. Please check your inbox.");
      // We show a generic success message for security reasons,
      // so we don't reveal which emails are registered.
    }
  };

  return (
    <>
      <PageHeader
        title="Forgot Your Password?"
        subtitle="No problem. Enter your email address and we'll send you a link to reset it."
      />
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
          {success ? (
            <div className="p-4 text-center bg-green-50 text-green-700 border border-green-200 rounded-lg">
              <h3 className="font-semibold">Check Your Email</h3>
              <p className="text-sm mt-1">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm text-center">{error}</div>}

              <FormInput 
                label="Your Email Address" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoComplete="email"
              />
              
              <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-deep-night py-3 font-semibold text-white rounded-lg hover:bg-graphite transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </div>

              <div className="text-center text-sm">
                <Link href="/login" className="font-medium text-gray-500 hover:text-solar-flare-start">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default ForgotPasswordPage;