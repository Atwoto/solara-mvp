'use client';

import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const WhatsAppButton = () => {
    // Phone number and pre-filled message for better user experience
    const phoneNumber = '254795857846';
    const message = "Hello! I'm interested in your solar solutions.";
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="fixed bottom-5 left-5 z-50 flex items-center"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 1.5, ease: [0.16, 1, 0.3, 1] }} // Delayed entrance animation
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Interactive Tooltip that appears on hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 'auto' }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="mr-3"
                    >
                        <div className="px-4 py-2.5 bg-white text-deep-night text-sm font-semibold rounded-full shadow-lg whitespace-nowrap">
                            Chat on WhatsApp
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The main button, wrapped in a Link component */}
            <Link
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
            >
                <motion.div
                    className="relative h-16 w-16 bg-whatsapp rounded-full flex items-center justify-center text-white shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    {/* Pulsing ring effect to draw attention */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-whatsapp"
                        animate={{
                            scale: [1, 1.4, 1, 1.4, 1],
                            opacity: [0.6, 0, 0.6, 0, 0.6],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeOut',
                            delay: 2,
                        }}
                    />
                    <FaWhatsapp className="h-8 w-8 z-10" />
                </motion.div>
            </Link>
        </motion.div>
    );
};

export default WhatsAppButton;