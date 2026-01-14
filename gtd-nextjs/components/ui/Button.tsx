'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
    primary: 'bg-[#003087] text-white hover:bg-[#00256b] active:bg-[#001e54] shadow-md hover:shadow-lg',
    secondary: 'bg-white text-[#003087] border border-[#003087] hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-600 dark:text-blue-300 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-[#0070BA] dark:text-gray-400 dark:hover:bg-gray-700'
};

const sizes = {
    sm: 'h-8 px-4 text-xs',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
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
                "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0070BA] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform active:scale-95",
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
