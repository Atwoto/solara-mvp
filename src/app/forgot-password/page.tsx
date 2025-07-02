// src/app/forgot-password/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, EnvelopeIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import AuthFormContainer from '@/components/auth/AuthFormContainer';
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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong.');
            }

            setMessage(data.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <BackgroundElements />
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
                        <h1 className="text-3xl font-bold text-deep-night">Forgot Your Password?</h1>
                        <p className="mt-2 text-gray-500">No problem. Enter your email and we'll send you a reset link.</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 overflow-hidden"
                                    >
                                        <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                                {message && (
                                     <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 overflow-hidden"
                                    >
                                        <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                                        <span>{message}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AuthInput
                                id="email"
                                name="email"
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                icon={<EnvelopeIcon className="h-5 w-5" />}
                            />
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !!message}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm font-medium text-solar-flare-end hover:underline flex items-center justify-center">
                               <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Sign In
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
