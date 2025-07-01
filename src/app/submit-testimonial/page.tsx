'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import PageHeader from '@/components/PageHeader'; // Your generic page header
import Image from 'next/image'; // For image preview
import {
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid'; // For star rating and alerts

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
    const { name, value, type } = e.target;
    // Asserting target as HTMLInputElement to access 'checked' property
    const { checked } = e.target as HTMLInputElement;
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
        e.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setError('File is too large. Maximum size is 2MB.');
        e.target.value = '';
        return;
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
      setError('Please fill in your name, email, and testimonial quote.');
      return;
    }
    if (!formData.consent) {
      setError('Please agree to the terms to submit your testimonial.');
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
      setSuccessMessage(
        result.message || 'Thank you! Your testimonial has been submitted for review.'
      );
      setFormData({
        client_name: '',
        email: '',
        client_title_company: '',
        quote: '',
        rating: 0,
        imageFile: null,
        consent: false,
      });
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
        <meta
          name="description"
          content="Submit your testimonial and share your experience with Bills On Solar."
        />
      </Head>

      <div className="bg-slate-50 dark:bg-slate-900">
        <PageHeader
          title="Share Your Experience"
          subtitle="We'd love to hear about your journey with solar energy!"
        />

        <div className="container mx-auto max-w-2xl py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800/50 dark:ring-1 dark:ring-white/10 shadow-2xl rounded-2xl">
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-10 space-y-8"
              noValidate
            >
              {/* --- ALERTS --- */}
              {error && (
                <div
                  className="flex items-start space-x-3 p-4 bg-red-50 text-red-800 border-l-4 border-red-500 rounded-r-lg dark:bg-red-900/20 dark:text-red-300 dark:border-red-600"
                  role="alert"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              {successMessage && (
                <div
                  className="flex items-start space-x-3 p-4 bg-green-50 text-green-800 border-l-4 border-green-500 rounded-r-lg dark:bg-green-900/20 dark:text-green-300 dark:border-green-600"
                  role="alert"
                >
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {/* --- FORM FIELDS --- */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="client_name"
                    className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="client_name"
                      id="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 sm:text-sm transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-yellow-400/50 dark:focus:border-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 sm:text-sm transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-yellow-400/50 dark:focus:border-yellow-400"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Your email will not be published.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="client_title_company"
                  className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
                >
                  Title / Company{' '}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="mt-2.5">
                  <input
                    type="text"
                    name="client_title_company"
                    id="client_title_company"
                    value={formData.client_title_company}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 sm:text-sm transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-yellow-400/50 dark:focus:border-yellow-400"
                    placeholder="e.g., Homeowner, CEO at Solar Inc."
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote"
                  className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
                >
                  Your Testimonial <span className="text-red-500">*</span>
                </label>
                <div className="mt-2.5">
                  <textarea
                    name="quote"
                    id="quote"
                    rows={5}
                    value={formData.quote}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 sm:text-sm transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-yellow-400/50 dark:focus:border-yellow-400"
                    placeholder="Share your experience with our products and services..."
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2.5">
                    Rating{' '}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarIcon
                        key={star}
                        className={`h-8 w-8 cursor-pointer transition-colors duration-200 ${
                          formData.rating >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300 dark:text-slate-600 dark:hover:text-yellow-400'
                        }`}
                        onClick={() => handleRatingChange(star)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-grow">
                  <label
                    htmlFor="imageFile"
                    className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2.5"
                  >
                    Upload Photo{' '}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="file"
                    name="imageFile"
                    id="imageFile"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600 cursor-pointer"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Max 2MB. JPG, PNG, or WEBP.
                  </p>
                </div>
                {imagePreview && (
                  <div className="flex-shrink-0">
                    <Image
                      src={imagePreview}
                      alt="Image preview"
                      width={100}
                      height={100}
                      className="h-24 w-24 object-cover rounded-xl border-2 border-slate-200 dark:border-slate-600"
                    />
                  </div>
                )}
              </div>

              {/* --- CONSENT --- */}
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    required
                    className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 dark:bg-slate-600 dark:border-slate-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label
                    htmlFor="consent"
                    className="font-semibold text-gray-900 dark:text-gray-100"
                  >
                    I agree to the terms <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    By submitting, I consent to Bills On Solar EA Limited using
                    my testimonial, name, and (if provided) photo on their
                    website and in marketing materials.
                  </p>
                </div>
              </div>

              {/* --- SUBMIT BUTTON --- */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-deep-night hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-deep-night disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out dark:focus:ring-offset-slate-800"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitTestimonialPage;