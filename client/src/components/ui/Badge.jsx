import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        neutral: 'bg-slate-100 text-slate-700',
    };

    return (
        <span className={`badge ${variants[variant] || variants.primary} ${className}`}>
            {children}
        </span>
    );
};
