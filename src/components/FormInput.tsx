// src/components/FormInput.tsx
import { ChangeEvent } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // For password toggle
import { useState } from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; // Make it easy to add the required attribute
  error?: string | null; // To display validation errors for this specific field
  autoComplete?: string; // For better browser autofill
}

const FormInput = ({ label, name, type, placeholder, value, onChange, required = false, error = null, autoComplete }: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          id={name}
          className={`block w-full p-3 sm:text-sm border rounded-lg transition-colors
                      ${error ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500' 
                             : 'border-gray-300 focus:border-deep-night focus:ring-deep-night'}
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>
        )}
      </div>
      {error && <p id={`${name}-error`} className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default FormInput;