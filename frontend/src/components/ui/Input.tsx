// src/components/ui/Input.tsx
import { forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full rounded-md px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-dark-800 border border-gray-700 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        error: 'bg-dark-800 border-2 border-red-500 text-white focus:ring-2 focus:ring-red-500/20',
        success: 'bg-dark-800 border-2 border-green-500 text-white focus:ring-2 focus:ring-green-500/20',
        ghost: 'bg-transparent border-transparent text-white hover:bg-dark-800 focus:bg-dark-800',
      },
      inputSize: {
        sm: 'h-8 text-xs px-2',
        md: 'h-10 text-sm px-3',
        lg: 'h-12 text-base px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant: variantProp,
      inputSize,
      type: typeProp = 'text',
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine variant based on error/success state
    const variant = error ? 'error' : success ? 'success' : variantProp;

    // Determine input type
    const type = typeProp === 'password' && showPassword ? 'text' : typeProp;

    // Determine if we should show password toggle
    const shouldShowPasswordToggle = showPasswordToggle && typeProp === 'password';

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              inputVariants({ variant, inputSize }),
              leftIcon && 'pl-10',
              (rightIcon || shouldShowPasswordToggle || error || success) && 'pr-10',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Content */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Error Icon */}
            {error && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}

            {/* Success Icon */}
            {success && !error && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}

            {/* Password Toggle */}
            {shouldShowPasswordToggle && !error && !success && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
                disabled={disabled}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Right Icon */}
            {rightIcon && !shouldShowPasswordToggle && !error && !success && (
              <span className="text-gray-400">{rightIcon}</span>
            )}
          </div>
        </div>

        {/* Helper/Error/Success Text */}
        {(error || success || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              error && 'text-red-500',
              success && 'text-green-500',
              !error && !success && 'text-gray-400'
            )}
          >
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
