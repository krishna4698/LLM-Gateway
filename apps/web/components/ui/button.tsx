import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 shadow-sm rounded-lg',
      secondary: 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800 rounded-lg',
      outline: 'bg-transparent text-zinc-200 hover:bg-zinc-900 border border-zinc-800 rounded-lg',
      ghost: 'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 rounded-lg',
      danger: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-sm px-4 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

