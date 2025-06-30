// src/components/auth/AuthInput.tsx
import { ChangeEvent, ReactNode, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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



// ... (interface remains the same)

export default function AuthInput({ id, name, label, type, value, onChange, icon, required = false }: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === 'password';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
        <input
          id={id}
          name={name}
          type={isPasswordField && isPasswordVisible ? 'text' : type}
          value={value}
          onChange={onChange}
          required={required}
          // --- THIS IS THE FIX ---
          // Added `border` to ensure the border is always visible.
          className="block w-full rounded-xl border border-gray-300 shadow-sm pl-10 pr-10 py-3 focus:border-solar-flare-start focus:ring-solar-flare-start sm:text-sm"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
          </button>
        )}
      </div>
    </div>
  );
}