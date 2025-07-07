
// src/app/contact/page.tsx
'use client'; // For form handling and potential interactivity

import { useState, FormEvent } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import PageHeader from "@/components/PageHeader";
import FormInput from "@/components/FormInput";


// src/app/contact/page.tsx
// ... (keep other imports and component code as before) ...

const ContactPage: NextPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error' | null>(null); // For styling message

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitMessageType(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage(result.message || 'Thank you for your message! We will get back to you soon.');
        setSubmitMessageType('success');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
      } else {
        setSubmitMessage(result.message || 'Sorry, there was an error sending your message. Please try again.');
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
    <>
      {/* ... (Head and first hero section remain the same) ... */}
      <div className="bg-gradient-to-br from-gray-100 to-sky-100 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-deep-night tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600">
            We're here to help with all your solar energy needs. Reach out to us with any questions or inquiries.
          </p>
        </motion.div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Contact Information Section (remains the same) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-8 p-6 sm:p-8 bg-gray-50 rounded-xl shadow-lg"
            >
              {/* ... (contact details and map remain the same) ... */}
               <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-deep-night mb-6">Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start space-x-3">
                    <EnvelopeIcon className="h-6 w-6 text-solar-flare-start flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <a href="mailto:onsolarbills@gmail.com" className="hover:text-solar-flare-end transition-colors">
                        onsolarbills@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="h-6 w-6 text-solar-flare-start flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Call Us</h3>
                      <a href="tel:+254712345678" className="hover:text-solar-flare-end transition-colors">
                        +254 712 345678 {/* Replace with actual phone */}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-6 w-6 text-solar-flare-start flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Visit Us</h3>
                      <p>123 Solar Street, Nairobi, Kenya</p> {/* Replace with actual address */}
                      <p>Open: Mon - Fri, 9 AM - 5 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-medium text-deep-night mb-3">Our Location</h3>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.277491953434!2d36.816600949999996!3d-1.2863892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b6fe9558!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1678886400000!5m2!1sen!2sus"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </motion.div>


            {/* Contact Form Section (updated submitMessage display) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="p-6 sm:p-8 bg-white rounded-xl shadow-xl"
            >
              <h2 className="text-2xl sm:text-3xl font-semibold text-deep-night mb-8">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ... (form inputs remain the same) ... */}
                 <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea name="message" id="message" rows={5} required value={formData.message} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm"></textarea>
                </div>

                <div>
                  <button type="submit" disabled={isSubmitting}
                          className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-gradient-to-r from-solar-flare-start to-solar-flare-end hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-flare-end disabled:opacity-50 transition-opacity">
                    {/* ... (button submitting/idle state remains the same) ... */}
                     {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  <p className={`mt-4 text-sm text-center font-medium ${
                    submitMessageType === 'success' ? 'text-green-600' : 
                    submitMessageType === 'error' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {submitMessage}
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;