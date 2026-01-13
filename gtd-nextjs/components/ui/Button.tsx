'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
};

const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10 p-2 flex items-center justify-center'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
}

export default function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
