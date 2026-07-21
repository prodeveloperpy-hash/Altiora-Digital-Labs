import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/12 text-success ring-1 ring-inset ring-success/25',
  warning: 'bg-warning/15 text-warning ring-1 ring-inset ring-warning/30',
  destructive: 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25',
  outline: 'border border-border text-foreground',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
