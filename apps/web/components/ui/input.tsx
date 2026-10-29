import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500',
            'transition-colors duration-150 outline-none',
            'focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500',
            error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

