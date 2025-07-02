// src/components/auth/AuthInput.tsx
'use client';

import { ChangeEvent, ReactNode, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface AuthInputProps {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'email' | 'password';
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    icon: ReactNode;
    required?: boolean;
}

export default function AuthInput({ id, name, label, type, value, onChange, icon, required = false }: AuthInputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                {icon}
            </div>
            <input
                id={id}
                name={name}
                type={isPasswordField && isPasswordVisible ? 'text' : type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder=" " // Required for the floating label effect
                className="peer block w-full rounded-xl border border-gray-300 shadow-sm pl-12 pr-12 py-3.5 focus:border-solar-flare-start focus:ring-solar-flare-start sm:text-sm transition-colors bg-gray-50/50"
            />
            <label
                htmlFor={id}
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 left-10
                peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
                {label}
            </label>
            {isPasswordField && (
                <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                >
                    {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
            )}
        </div>
    );
}
