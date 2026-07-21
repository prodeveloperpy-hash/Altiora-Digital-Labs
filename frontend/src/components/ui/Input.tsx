import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** When true, applies error styling and sets aria-invalid. */
  hasError?: boolean;
  /** Optional adornment rendered on the leading edge (e.g. an icon). */
  startAdornment?: ReactNode;
  /** Optional adornment rendered on the trailing edge. */
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError = false, startAdornment, endAdornment, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        'h-11 w-full rounded-xl border bg-card px-3.5 text-sm text-foreground shadow-sm transition-all duration-[250ms]',
        'placeholder:text-muted-foreground/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-60',
        hasError ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
        startAdornment ? 'pl-10' : undefined,
        endAdornment ? 'pr-10' : undefined,
        className,
      )}
      {...props}
    />
  );

  if (!startAdornment && !endAdornment) return input;

  return (
    <div className="relative">
      {startAdornment && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {startAdornment}
        </span>
      )}
      {input}
      {endAdornment && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {endAdornment}
        </span>
      )}
    </div>
  );
});
