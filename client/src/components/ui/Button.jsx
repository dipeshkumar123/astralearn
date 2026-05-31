import React from 'react';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        ghost: 'btn-ghost',
    }[variant] || 'btn-primary';
    const sizeClass = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-3 text-sm sm:text-base',
        lg: 'px-6 py-3.5 text-base sm:text-lg',
    }[size] || 'px-5 py-3 text-sm sm:text-base';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children}
        </button>
    );
};
