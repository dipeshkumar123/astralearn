import React from 'react';

export const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
    const variants = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        neutral: 'bg-slate-100 text-slate-700',
    };
    const sizes = {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span className={`badge ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}>
            {children}
        </span>
    );
};
