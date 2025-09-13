'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md dark:bg-primary-500 dark:hover:bg-primary-600',
        secondary: 'bg-secondary-100 text-secondary-900 shadow-sm hover:bg-secondary-200 hover:shadow-md dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700',
        outline: 'border border-secondary-300 bg-transparent text-secondary-700 shadow-sm hover:bg-secondary-50 hover:shadow-md dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800/50',
        ghost: 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-800 dark:hover:text-secondary-100',
        danger: 'bg-danger-600 text-white shadow-sm hover:bg-danger-700 hover:shadow-md',
        success: 'bg-success-600 text-white shadow-sm hover:bg-success-700 hover:shadow-md',
        gradient: 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-sm hover:from-primary-700 hover:to-accent-700 hover:shadow-md hover:shadow-primary-500/25',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 py-3 text-base',
        xl: 'h-14 px-8 py-4 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="spinner mr-2" />
        )}
        {!loading && leftIcon && (
          <span className="text-current">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="text-current">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
