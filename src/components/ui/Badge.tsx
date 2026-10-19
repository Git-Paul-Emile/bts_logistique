import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 rounded-full px-2.5 py-0.5 font-medium',
  success: 'bg-transparent text-emerald-600 font-semibold',
  warning: 'bg-transparent text-amber-600 font-semibold',
  danger: 'bg-transparent text-rose-600 font-semibold',
  info: 'bg-transparent text-blue-600 font-semibold',
  muted: 'bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5 font-medium',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
