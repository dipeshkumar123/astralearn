import React from 'react';

export interface DebugButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const DebugButton: React.FC<DebugButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('DebugButton clicked', { variant, size, loading, disabled });
    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  // Simple class construction without clsx
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-200';
      break;
    case 'outline':
      variantClasses = 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 bg-transparent';
      break;
    case 'ghost':
      variantClasses = 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 bg-transparent';
      break;
    case 'danger':
      variantClasses = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1.5 text-sm gap-1.5';
      break;
    case 'md':
      sizeClasses = 'px-4 py-2 text-sm gap-2';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base gap-2.5';
      break;
  }

  const finalClassName = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <button
      className={finalClassName}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span>Loading...</span>
      ) : (
        children
      )}
    </button>
  );
};
