// src/app/update-password/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import FormInput from '@/components/FormInput';
import PageHeader from '@/components/PageHeader';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false); // To check if Supabase has processed the token from URL
  const router = useRouter();

  useEffect(() => {
    // Supabase client automatically reads the #access_token fragment from the URL on page load.
    // The onAuthStateChange listener then fires with a 'PASSWORD_RECOVERY' event.
    // We listen for this event to know we have a valid session to update the password.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event detected. Session available for update.");
        setIsSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

    const { data, error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Your password has been updated successfully!");
      // After success, you might want to sign the user out of any old sessions and redirect
      setTimeout(() => {
        supabase.auth.signOut(); // Sign out to clear any recovery session state
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <>
      <PageHeader
        title="Update Your Password"
        subtitle="Please enter and confirm your new password below."
      />
      <main className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
          {success ? (
            <div className="p-4 text-center bg-green-50 text-green-700 border border-green-200 rounded-lg">
              <h3 className="font-semibold">Success!</h3>
              <p className="text-sm mt-1">{success} Redirecting you to the login page...</p>
            </div>
          ) : isSessionReady ? ( // Only show the form if the recovery session is ready
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm text-center">{error}</div>}
              
              <FormInput label="New Password" name="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <FormInput label="Confirm New Password" name="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              
              <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-deep-night py-3 font-semibold text-white rounded-lg hover:bg-graphite transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          ) : (
            // Show a loading or processing message while Supabase checks the URL token
            <div className="text-center text-gray-500">
                <p>Verifying recovery link...</p>
                {/* You can add a spinner/loader component here */}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default UpdatePasswordPage;