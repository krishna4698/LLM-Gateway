import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'revoked' | 'neutral' | 'live';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 before:bg-emerald-400',
    revoked: 'bg-rose-500/10 text-rose-400 border-rose-500/25 before:bg-rose-400',
    neutral: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50 before:hidden',
    live: 'bg-sky-500/10 text-sky-400 border-sky-500/25 before:bg-sky-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border',
        'before:w-1.5 before:h-1.5 before:rounded-full',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

