'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

// A simple confetti component for celebration
const Confetti = () => {
    const colors = ['#FDB813', '#F58220', '#FFFFFF', '#FFD700'];
    const confetti = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 100,
        rotate: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 1,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {confetti.map(c => (
                <motion.div
                    key={c.id}
                    className="absolute w-2 h-4"
                    style={{ left: `${c.x}%`, top: `${c.y}%`, rotate: `${c.rotate}deg`, backgroundColor: c.color }}
                    animate={{ y: '120vh', rotate: c.rotate + 180 }}
                    transition={{ duration: c.duration, delay: c.delay, ease: 'linear' }}
                />
            ))}
        </div>
    );
};

export default function OrderConfirmationClientPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after the initial animation
    const timer = setTimeout(() => setShowConfetti(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto overflow-hidden border border-gray-200/50"
    >
        {showConfetti && <Confetti />}

        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="relative z-10"
        >
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
        </motion.div>

        <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl sm:text-4xl font-extrabold text-green-600 mt-6"
        >
            Thank You!
        </motion.h1>

        <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 text-lg text-gray-700"
        >
            Your order has been placed successfully.
        </motion.p>
      
        {orderId && (
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-4 text-gray-600"
            >
                Your Order ID is:{' '}
                <span className="font-mono bg-gray-100 text-deep-night py-1 px-2 rounded-md">{orderId}</span>
            </motion.div>
        )}

        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
            <Link 
                href="/products" 
                className="w-full sm:w-auto inline-block bg-deep-night text-white px-8 py-3 rounded-full shadow-md hover:bg-graphite transition-colors transform hover:scale-105"
            >
                Continue Shopping
            </Link>
             <Link 
                href="/account" 
                className="w-full sm:w-auto group inline-flex items-center justify-center bg-gray-100 text-gray-700 px-8 py-3 rounded-full shadow-sm hover:bg-gray-200 transition-colors transform hover:scale-105"
            >
                View My Orders
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
        </motion.div>
    </motion.div>
  );
}
