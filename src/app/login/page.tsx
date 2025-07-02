// src/app/login/page.tsx
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import LoginForm from "@/components/LoginForm";
import { Suspense } from 'react';
import { SunIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Link from "next/link"; // --- THIS IS THE FIX ---

function LoginPageContent() {
    return (
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}

// A new component for the animated background elements
const BackgroundElements = () => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-white via-yellow-50 to-orange-100/20">
        <motion.div
            className="absolute -top-20 -left-20 w-96 h-96 bg-yellow-200/50 rounded-full filter blur-3xl opacity-50"
            animate={{
                scale: [1, 1.1, 1],
                x: [-20, 20, -20],
                y: [10, -10, 10],
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
            }}
        />
        <motion.div
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-orange-200/50 rounded-full filter blur-3xl opacity-50"
             animate={{
                scale: [1, 1.05, 1],
                x: [20, -20, 20],
                y: [-10, 10, -10],
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: 'reverse',
            }}
        />
        <SunIcon className="absolute h-40 w-40 text-yellow-200/30 top-10 right-1/4 animate-float" style={{ animationDelay: '-1s' }} />
        <SunIcon className="absolute h-24 w-24 text-yellow-200/20 bottom-10 left-1/3 animate-float" style={{ animationDelay: '-3s' }} />
    </div>
);

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <BackgroundElements />
            
            <div className="relative z-10 flex flex-col items-center w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="mb-8 text-center"
                >
                    <Link href="/" className="inline-block p-4 bg-gradient-to-br from-solar-flare-start to-orange-400 rounded-full shadow-lg mb-4">
                        <SunIcon className="h-8 w-8 text-white" />
                    </Link>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-deep-night">
                        Bills On Solar
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Powering a Brighter, Cleaner Future
                    </p>
                </motion.div>
                <AuthFormContainer>
                    <LoginPageContent />
                </AuthFormContainer>
            </div>
        </div>
    );
}
