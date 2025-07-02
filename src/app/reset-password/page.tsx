// /src/app/reset-password/page.tsx

'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, LockClosedIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import AuthInput from '@/components/auth/AuthInput';

// Reusing the same impressive background from the login page
const BackgroundElements = () => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-white via-yellow-50 to-orange-100/20">
        <motion.div
            className="absolute -top-20 -left-20 w-96 h-96 bg-yellow-200/50 rounded-full filter blur-3xl opacity-50"
            animate={{ scale: [1, 1.1, 1], x: [-20, 20, -20], y: [10, -10, 10] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.div
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-orange-200/50 rounded-full filter blur-3xl opacity-50"
             animate={{ scale: [1, 1.05, 1], x: [20, -20, 20], y: [-10, 10, -10] }}
            transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse' }}
        />
    </div>
);

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token. Please request a new link.");
        }
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Something went wrong.');

            setMessage(data.message);
            setTimeout(() => router.push('/login'), 3000); // Redirect to login after 3 seconds
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex flex-col items-center w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block p-4 bg-gradient-to-br from-solar-flare-start to-orange-400 rounded-full shadow-lg mb-4">
                        <SunIcon className="h-8 w-8 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold text-deep-night">Reset Your Password</h1>
                    <p className="mt-2 text-gray-500">Choose a new, secure password for your account.</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 overflow-hidden">
                                    <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                            {message && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 overflow-hidden">
                                    <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <span>{message} Redirecting to login...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AuthInput id="password" name="password" label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required icon={<LockClosedIcon className="h-5 w-5" />} />
                        <AuthInput id="confirmPassword" name="confirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required icon={<LockClosedIcon className="h-5 w-5" />} />
                        
                        <div>
                            <button type="submit" disabled={isLoading || !token || !!message} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.98]">
                                {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
         <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <BackgroundElements />
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
