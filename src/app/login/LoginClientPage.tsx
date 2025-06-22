'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormInput from "@/components/FormInput";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { ArrowPathIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/solid';

// Enhanced FormInput component with beautiful animations and proper TypeScript types
interface EnhancedFormInputProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const EnhancedFormInput: React.FC<EnhancedFormInputProps> = ({ 
  label, 
  name, 
  type, 
  placeholder, 
  value, 
  onChange, 
  required, 
  autoComplete, 
  icon: Icon 
}) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="relative group">
      <label className={`absolute left-3 transition-all duration-300 pointer-events-none z-10 ${
        focused || value ? '-top-2 text-xs bg-gradient-to-r from-white to-gray-100 px-2 text-indigo-600 font-medium rounded' : 'top-3 text-gray-400'
      }`}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-300 z-10 ${
            focused ? 'text-indigo-600' : 'text-gray-400'
          }`} />
        )}
        <input
          name={name}
          type={type}
          placeholder={focused ? placeholder : ''}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0 bg-white/50 backdrop-blur-sm relative ${
            focused 
              ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 bg-white/80' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
        />
      </div>
    </div>
  );
};

export default function LoginClientPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCredentialsLoading, setIsCredentialsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCredentialsSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsCredentialsLoading(true);

    const result = await signIn('credentials', {
      redirect: false, 
      email: email,
      password: password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      console.error("Credentials Sign-in error:", result.error);
      setIsCredentialsLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGoogleSignIn = (): void => {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl }); 
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const isLoading = isCredentialsLoading || isGoogleLoading;

  if (!mounted) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 animate-pulse">
        <div className="text-center space-y-2">
          <div className="h-8 bg-white/10 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="h-12 bg-white/10 rounded-xl"></div>
        <div className="space-y-4">
          <div className="h-12 bg-white/10 rounded-xl"></div>
          <div className="h-12 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md transform transition-all duration-700 hover:scale-105">
      <div className="p-8 space-y-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl shadow-black/20 relative overflow-hidden">
        {/* Glass reflection effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg animate-pulse-slow">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-200 text-lg">
            Sign in to continue your journey
          </p>
          <div className="mt-4">
            <span className="text-gray-300">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-300 hover:to-pink-300 transition-all duration-300 relative group">
              Sign up
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            disabled={isLoading}
            className="w-full group relative overflow-hidden bg-white/90 backdrop-blur-sm hover:bg-white border border-white/30 rounded-2xl p-4 font-medium text-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center relative z-10">
              {isGoogleLoading ? (
                <ArrowPathIcon className="h-6 w-6 mr-3 animate-spin text-indigo-600" />
              ) : (
                <FcGoogle className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              )}
              <span className="text-lg">
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink mx-6 text-white/60 font-medium bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
            OR
          </span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-2xl text-center backdrop-blur-sm animate-shake">
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <EnhancedFormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            required
            autoComplete="email"
            icon={EnvelopeIcon}
          />

          <div className="relative">
            <EnhancedFormInput
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
              autoComplete="current-password"
              icon={LockClosedIcon}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-20"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-gray-300 hover:text-white transition-colors duration-300 relative group">
              Forgot password?
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center relative z-10">
              {isCredentialsLoading && (
                <ArrowPathIcon className="h-6 w-6 mr-3 animate-spin" />
              )}
              <span className="text-lg">
                {isCredentialsLoading ? 'Signing In...' : 'Sign In'}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}