// components/ContactSection.tsx
'use client';

import { useState, FormEvent } from 'react';
import { PaperAirplaneIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ContactSection = () => {
  // State management for the form (re-using your proven logic)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // The submission handler that connects to your Supabase backend via the API route
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
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
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

  return (
    <div className="bg-deep-night text-white py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: The "Hook" */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Your Solar Journey
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-solar-flare-start to-solar-flare-end mt-2">
                Starts Here
              </span>
            </h2>
            <p className="mt-6 text-lg text-gray-300 max-w-lg mx-auto lg:mx-0">
              Have a question or ready to get a quote? Fill out the form, and one of our solar experts will contact you to discuss your project.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-8 justify-center lg:justify-start">
               <div className="flex items-center gap-3">
                 <PhoneIcon className="h-7 w-7 text-solar-flare-start"/>
                 <div>
                    <h3 className="font-semibold">Call Us Directly</h3>
                    <a href="tel:+254702156134" className="text-gray-300 hover:text-white transition-colors">
                      +254 702 156 134
                    </a>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <EnvelopeIcon className="h-7 w-7 text-solar-flare-start"/>
                 <div>
                    <h3 className="font-semibold">Email for Inquiries</h3>
                    <a href="mailto:info@billseasonsolar.co.ke" className="text-gray-300 hover:text-white transition-colors">
                      info@billseasonsolar.co.ke
                    </a>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Right Column: The Form */}
          <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, amount: 0.3 }}
             transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
             className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-graphite">Full Name</label>
                  <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full text-graphite bg-gray-50 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-end focus:border-solar-flare-end" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-graphite">Email Address</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full text-graphite bg-gray-50 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-end focus:border-solar-flare-end" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-graphite">Subject</label>
                <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="mt-1 block w-full text-graphite bg-gray-50 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-end focus:border-solar-flare-end" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-graphite">Message</label>
                <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="mt-1 block w-full text-graphite bg-gray-50 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-end focus:border-solar-flare-end"></textarea>
              </div>
              <div>
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-flare-end disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
              {submitMessage && (
                <p className={`mt-3 text-sm text-center font-medium ${submitMessageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {submitMessage}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;