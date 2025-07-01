'use client';

import { useState, FormEvent, MouseEvent, ChangeEvent, ReactNode } from 'react';
import { PaperAirplaneIcon, PhoneIcon, EnvelopeIcon, UserIcon, PencilIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// A reusable, styled input component for a cleaner form structure
const FormInput = ({ id, name, type = 'text', placeholder, icon, value, onChange }: {
    id: string;
    name: string;
    type?: string;
    placeholder: string;
    icon: ReactNode;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div>
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                {icon}
            </div>
            <input
                type={type}
                name={name}
                id={id}
                required
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="block w-full text-white bg-white/5 px-4 py-3 pl-12 border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-solar-flare-end focus:border-solar-flare-end transition-all"
            />
        </div>
    </div>
);

const ContactSection = () => {
    // State management for the form (functionality is unchanged)
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error' | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // The submission handler (functionality is unchanged)
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);
        setSubmitMessageType(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (response.ok) {
                setSubmitMessage(result.message || 'Thank you! Your message has been sent successfully.');
                setSubmitMessageType('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setSubmitMessage(result.message || 'An error occurred. Please try again.');
                setSubmitMessageType('error');
            }
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitMessage('An unexpected error occurred. Please try again later.');
            setSubmitMessageType('error');
        }
        setIsSubmitting(false);
    };

    // This function updates CSS custom properties for the spotlight effect
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty('--x', `${x}px`);
        e.currentTarget.style.setProperty('--y', `${y}px`);
    };

    const sectionVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    return (
        <section className="relative bg-deep-night text-white py-20 sm:py-28 overflow-hidden">
            {/* Animated Aurora Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="aurora-bg">
                    <div className="aurora-dot"></div>
                    <div className="aurora-dot"></div>
                </div>
            </div>

            <div className="relative container mx-auto px-4 z-10">
                <motion.div
                    className="relative p-8 sm:p-12 bg-gray-900/20 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    onMouseMove={handleMouseMove}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={sectionVariants}
                >
                    {/* Interactive Spotlight Effect */}
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
                         style={{
                            background: `radial-gradient(800px circle at var(--x) var(--y), rgba(253, 184, 19, 0.1), transparent 40%)`,
                         }}
                    />

                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Column: The "Hook" */}
                        <motion.div variants={itemVariants} className="text-center lg:text-left">
                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                                Your Solar Journey
                                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-solar-flare-start to-solar-flare-end mt-2">
                                    Starts Here
                                </span>
                            </h2>
                            <p className="mt-6 text-lg text-gray-300 max-w-lg mx-auto lg:mx-0">
                                Have a question or ready to get a quote? Fill out the form, and one of our solar experts will contact you to discuss your project.
                            </p>
                            <div className="mt-10 space-y-6">
                                <a href="tel:+254702156134" className="group flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors duration-300">
                                    <PhoneIcon className="h-8 w-8 text-solar-flare-start transition-transform duration-300 group-hover:scale-110"/>
                                    <div>
                                        <h3 className="font-semibold">Call Us Directly</h3>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">+254 702 156 134</span>
                                    </div>
                                </a>
                                <a href="mailto:info@billseasonsolar.co.ke" className="group flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors duration-300">
                                    <EnvelopeIcon className="h-8 w-8 text-solar-flare-start transition-transform duration-300 group-hover:scale-110"/>
                                    <div>
                                        <h3 className="font-semibold">Email for Inquiries</h3>
                                        <span className="text-gray-300 group-hover:text-white transition-colors">info@billseasonsolar.co.ke</span>
                                    </div>
                                </a>
                            </div>
                        </motion.div>

                        {/* Right Column: The Form */}
                        <motion.div variants={itemVariants}>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <FormInput id="name" name="name" placeholder="Full Name" icon={<UserIcon className="h-5 w-5 text-gray-400"/>} value={formData.name} onChange={handleChange} />
                                    <FormInput id="email" name="email" type="email" placeholder="Email Address" icon={<EnvelopeIcon className="h-5 w-5 text-gray-400"/>} value={formData.email} onChange={handleChange} />
                                </div>
                                <FormInput id="subject" name="subject" placeholder="Subject" icon={<PencilIcon className="h-5 w-5 text-gray-400"/>} value={formData.subject} onChange={handleChange} />
                                <div>
                                    <label htmlFor="message" className="sr-only">Message</label>
                                    <div className="relative">
                                         <div className="pointer-events-none absolute top-4 left-0 flex items-center pl-4">
                                            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} placeholder="Your Message" className="block w-full text-white bg-white/5 px-4 py-3 pl-12 border border-white/10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-solar-flare-end focus:border-solar-flare-end transition-all"></textarea>
                                    </div>
                                </div>
                                <div>
                                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-deep-night bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:shadow-solar-flare-start/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-night focus:ring-solar-flare-end disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100">
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <PaperAirplaneIcon className="h-5 w-5 mr-2 -rotate-45" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {submitMessage && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className={`mt-3 text-sm text-center font-medium ${submitMessageType === 'success' ? 'text-green-400' : 'text-red-400'}`}
                                        >
                                            {submitMessage}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
             {/* Reusing Aurora styles from previous components */}
             <style jsx global>{`
                .aurora-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; }
                .aurora-dot { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.7; }
                .aurora-dot:nth-child(1) { width: 500px; height: 500px; background-color: rgba(253, 184, 19, 0.1); animation: aurora-1 20s infinite alternate; }
                .aurora-dot:nth-child(2) { width: 400px; height: 400px; background-color: rgba(245, 130, 32, 0.1); animation: aurora-2 22s infinite alternate; }
                @keyframes aurora-1 { 0% { transform: translate(10vw, 20vh); } 100% { transform: translate(70vw, 80vh); } }
                @keyframes aurora-2 { 0% { transform: translate(80vw, 10vh); } 100% { transform: translate(30vw, 90vh); } }
            `}</style>
        </section>
    );
};

export default ContactSection;