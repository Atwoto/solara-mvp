'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { ArrowPathIcon, ExclamationCircleIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import AuthInput from './auth/AuthInput';
import { AnimatePresence, motion } from 'framer-motion';

export default function LoginForm() {
    // All state and logic remains the same
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const authError = searchParams.get('error');

    useEffect(() => {
        if (authError && !error) {
            if (authError === 'Callback') {
                setError('An error occurred during sign-in. Please try again.');
            } else {
                setError('Authentication failed. Please check your credentials.');
            }
        }
    }, [authError, error]);

    const handleCredentialsSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        setIsLoading(false);
        
        if (result?.error) {
            setError(result.error);
        } else if (result?.ok) {
            router.push(callbackUrl);
            router.refresh();
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        setError(null);
        signIn('google', { callbackUrl });
    };

    return (
        <div className="w-full space-y-6">
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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
                </AnimatePresence>
                <AuthInput
                    id="email" name="email" label="Email Address" type="email"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                />
                <div>
                    <AuthInput
                        id="password" name="password" label="Password" type="password"
                        value={password} onChange={e => setPassword(e.target.value)} required
                        icon={<LockClosedIcon className="h-5 w-5" />}
                    />
                    <div className="flex items-center justify-end mt-2">
                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-semibold text-solar-flare-end hover:underline">Forgot password?</Link>
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 disabled:shadow-sm transition-all active:scale-[0.98] duration-300 ease-in-out"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={isLoading ? 'loading' : 'signIn'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Sign In'}
                            </motion.span>
                        </AnimatePresence>
                    </button>
                </div>
            </form>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div>
                <button onClick={handleGoogleSignIn} type="button" disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-md font-semibold text-graphite hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md disabled:opacity-60 transition-all active:scale-[0.98] duration-300 ease-in-out">
                    <FcGoogle className="h-6 w-6 mr-3" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
