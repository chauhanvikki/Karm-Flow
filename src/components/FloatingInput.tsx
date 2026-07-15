import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, type = 'text', className, registration, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={twMerge("relative w-full mb-5", className)}>
        <div className="relative">
          <input
            {...props}
            {...registration}
            type={inputType}
            ref={(e) => {
              registration.ref(e);
              if (typeof ref === 'function') ref(e);
              else if (ref) ref.current = e;
            }}
            onFocus={() => {
              /* no-op */
            }}
            onBlur={(e) => {
              registration.onBlur(e);
            }}
            onChange={registration.onChange}
            placeholder=" "
            className={clsx(
              "peer w-full h-[56px] rounded-lg border bg-white px-4 pt-5 pb-1 text-[15px] font-medium text-[#111111] transition-all outline-none",
              "focus:border-brand-accent focus:ring-1 focus:ring-brand-accent",
              error 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                : "border-[#EAEAEA] hover:border-[#CCCCCC]"
            )}
          />
          <label
            className={clsx(
              "absolute left-4 top-4 text-[#888888] transition-all duration-200 pointer-events-none transform origin-[0]",
              "peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-brand-accent",
              "peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:scale-[0.75]",
              error && "peer-focus:text-red-500"
            )}
          >
            {label}
          </label>
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        
        {error && (
          <p className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
