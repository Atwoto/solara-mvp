// src/app/submit-testimonial/page.tsx
'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import PageHeader from '@/components/PageHeader'; // Your generic page header
import Image from 'next/image'; // For image preview
import { StarIcon } from '@heroicons/react/24/solid'; // For star rating

const SubmitTestimonialPage = () => {
  const [formData, setFormData] = useState({
    client_name: '',
    email: '', // For internal use/contact, not necessarily public
    client_title_company: '',
    quote: '',
    rating: 0, // 0 means no rating given
    imageFile: null as File | null,
    consent: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
          setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
          e.target.value = ''; return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          setError('File is too large. Maximum size is 2MB.');
          e.target.value = ''; return;
      }
      setError(null);
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, imageFile: null }));
      setImagePreview(null);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setFormData(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.email.trim() || !formData.quote.trim()) {
        setError("Please fill in your name, email, and testimonial quote.");
        return;
    }
    if (!formData.consent) {
        setError("Please agree to the terms to submit your testimonial.");
        return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const submissionData = new FormData();
    submissionData.append('client_name', formData.client_name);
    submissionData.append('email', formData.email);
    submissionData.append('client_title_company', formData.client_title_company);
    submissionData.append('quote', formData.quote);
    if (formData.rating > 0) {
        submissionData.append('rating', formData.rating.toString());
    }
    if (formData.imageFile) {
        submissionData.append('imageFile', formData.imageFile);
    }
    submissionData.append('consent', formData.consent.toString());

    try {
      const response = await fetch('/api/testimonials/submit', {
        method: 'POST',
        body: submissionData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit testimonial.');
      }
      setSuccessMessage(result.message || "Thank you! Your testimonial has been submitted for review.");
      setFormData({ client_name: '', email: '', client_title_company: '', quote: '', rating: 0, imageFile: null, consent: false });
      setImagePreview(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Share Your Experience - Bills On Solar</title>
        <meta name="description" content="Submit your testimonial and share your experience with Bills On Solar." />
      </Head>
      <PageHeader title="Share Your Experience" subtitle="We'd love to hear about your journey with solar energy!" />

      <div className="container mx-auto max-w-2xl py-12 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-10 space-y-6 sm:space-y-8">
          {error && <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm" role="alert">{error}</div>}
          {successMessage && <div className="p-4 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm" role="alert">{successMessage}</div>}

          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="client_name" id="client_name" value={formData.client_name} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" />
            <p className="mt-1 text-xs text-gray-500">Your email will not be published.</p>
          </div>
          <div>
            <label htmlFor="client_title_company" className="block text-sm font-medium text-gray-700 mb-1">Title / Company (Optional)</label>
            <input type="text" name="client_title_company" id="client_title_company" value={formData.client_title_company} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="e.g., Homeowner, CEO at Solar Solutions Ltd."/>
          </div>
          <div>
            <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">Your Testimonial <span className="text-red-500">*</span></label>
            <textarea name="quote" id="quote" rows={5} value={formData.quote} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-solar-flare-start focus:border-solar-flare-start sm:text-sm" placeholder="Share your experience with our products and services..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (Optional)</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-7 w-7 cursor-pointer ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                  onClick={() => handleRatingChange(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">Upload Photo (Optional)</label>
            <input type="file" name="imageFile" id="imageFile" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-solar-flare-start file:text-white hover:file:bg-solar-flare-end cursor-pointer" />
            {imagePreview && (
              <div className="mt-3"><Image src={imagePreview} alt="Preview" width={100} height={100} className="h-24 w-24 object-cover rounded-md border"/></div>
            )}
            <p className="mt-1 text-xs text-gray-500">Max 2MB. JPG, PNG, or WEBP.</p>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input id="consent" name="consent" type="checkbox" checked={formData.consent} onChange={handleInputChange} required className="focus:ring-solar-flare-start h-4 w-4 text-solar-flare-start border-gray-300 rounded" />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="consent" className="font-medium text-gray-700">I agree to the terms <span className="text-red-500">*</span></label>
              <p className="text-gray-500 text-xs">By submitting this testimonial, I consent to Bills On Solar EA Limited using my testimonial, name, and (if provided) title/company and photo on their website and in marketing materials.</p>
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-deep-night hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-night disabled:opacity-60 transition-opacity">
              {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SubmitTestimonialPage;