import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeClass = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
} as const;

export interface SpinnerProps {
  size?: keyof typeof sizeClass;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className="inline-flex">
      <Loader2 className={cn('animate-spin text-primary', sizeClass[size], className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
