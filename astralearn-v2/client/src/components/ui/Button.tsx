import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
    ];

    const variantClasses = {
      primary: [
        'bg-primary-600 text-white hover:bg-primary-700',
        'focus:ring-primary-500 shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
        'focus:ring-secondary-500 border border-secondary-200',
      ],
      outline: [
        'border border-primary-600 text-primary-600 hover:bg-primary-50',
        'focus:ring-primary-500 bg-transparent',
      ],
      ghost: [
        'text-secondary-700 hover:bg-secondary-100',
        'focus:ring-secondary-500 bg-transparent',
      ],
      danger: [
        'bg-error-600 text-white hover:bg-error-700',
        'focus:ring-error-500 shadow-sm hover:shadow-md',
      ],
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className
    );

    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          leftIcon && (
            <span className="flex-shrink-0">
              {React.isValidElement(leftIcon)
                ? React.cloneElement(leftIcon as React.ReactElement, {
                    size: iconSize,
                  })
                : leftIcon}
            </span>
          )
        )}
        
        {children && <span>{children}</span>}
        
        {!loading && rightIcon && (
          <span className="flex-shrink-0">
            {React.isValidElement(rightIcon)
              ? React.cloneElement(rightIcon as React.ReactElement, {
                  size: iconSize,
                })
              : rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
