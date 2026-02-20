import React from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || React.useId();

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseClasses = [
      'block px-3 py-2 border rounded-lg shadow-sm',
      'placeholder-secondary-400 focus:outline-none focus:ring-2',
      'transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    ];

    const stateClasses = error
      ? [
          'border-error-300 focus:ring-error-500 focus:border-error-500',
          'text-error-900 placeholder-error-300',
        ]
      : [
          'border-secondary-300 focus:ring-primary-500 focus:border-primary-500',
          'text-secondary-900',
        ];

    const paddingClasses = [
      leftIcon && 'pl-10',
      (rightIcon || isPassword) && 'pr-10',
    ].filter(Boolean);

    const widthClasses = fullWidth ? 'w-full' : '';

    const inputClasses = clsx(
      baseClasses,
      stateClasses,
      paddingClasses,
      widthClasses,
      className
    );

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-secondary-400">
                {React.isValidElement(leftIcon)
                  ? React.cloneElement(leftIcon as React.ReactElement, {
                      size: 18,
                    })
                  : leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              <span className="text-secondary-400 hover:text-secondary-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </button>
          )}
          
          {!isPassword && rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-secondary-400">
                {React.isValidElement(rightIcon)
                  ? React.cloneElement(rightIcon as React.ReactElement, {
                      size: 18,
                    })
                  : rightIcon}
              </span>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-error-600" role="alert">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-secondary-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
