'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestContinue: (guestEmail: string) => void;
  onSignInSuccess: () => void;
}

type AuthMode = 'signin' | 'signup' | 'guest';

const GuestCheckoutModal = ({ isOpen, onClose, onGuestContinue, onSignInSuccess }: GuestCheckoutModalProps) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    guestEmail: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        onSignInSuccess();
        onClose();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Auto sign in after successful signup
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created but failed to sign in. Please try signing in manually.');
      } else {
        onSignInSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestCheckout = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.guestEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    onGuestContinue(formData.guestEmail);
    onClose();
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', guestEmail: '' });
    setError('');
    setShowPassword(false);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gradient-to-r from-solar-flare-start to-solar-flare-end p-6 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-deep-night hover:bg-black/10 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-deep-night">Complete Your Order</h2>
            <p className="text-deep-night/80 mt-1">Choose how you'd like to proceed</p>
          </div>

          <div className="flex border-b">
            {[
              { key: 'signin', label: 'Sign In' },
              { key: 'signup', label: 'Sign Up' },
              { key: 'guest', label: 'Guest' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchMode(key as AuthMode)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  authMode === key
                    ? 'text-solar-flare-end border-b-2 border-solar-flare-end bg-solar-flare-start/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-solar-flare-start to-solar-flare-end text-deep-night font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In & Continue'}
                </button>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start"
                      placeholder="Create a password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-solar-flare-start to-solar-flare-end text-deep-night font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
                </button>
              </form>
            )}

            {authMode === 'guest' && (
              <form onSubmit={handleGuestCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="guestEmail"
                      value={formData.guestEmail}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-flare-start focus:border-solar-flare-start"
                      placeholder="Enter your email for order confirmation"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  We'll use this email to send you order updates. You can create an account later to track your orders.
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-solar-flare-start to-solar-flare-end text-deep-night font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Continue as Guest
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuestCheckoutModal;