// src/components/auth/AuthFormContainer.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function AuthFormContainer({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname.includes('/login');

    return (
        <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
            <div className="p-8 sm:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-deep-night tracking-tight">
                        {isLoginPage ? 'Welcome Back!' : 'Create Your Account'}
                    </h1>
                    <p className="mt-2 text-gray-500">
                        {isLoginPage ? "Enter your credentials to access your account." : "Join us to start your solar journey."}
                    </p>
                </div>

                {/* Animated Tab Switcher */}
                <div className="relative grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-xl mb-8">
                    <Link href="/login" className="relative z-10 block w-full text-center px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-solar-flare-end">
                        <span className={isLoginPage ? 'text-white' : 'text-gray-600'}>Sign In</span>
                    </Link>
                    <Link href="/signup" className="relative z-10 block w-full text-center px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-solar-flare-end">
                         <span className={!isLoginPage ? 'text-white' : 'text-gray-600'}>Sign Up</span>
                    </Link>
                    {/* The "Magic Motion" highlight div */}
                    <motion.div
                        layoutId="active-auth-tab"
                        className={`absolute inset-y-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-lg shadow-md`}
                        initial={false}
                        animate={{ x: isLoginPage ? '0%' : '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                </div>

                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
