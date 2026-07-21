import { cn } from '@/lib/utils';

export interface ProgressProps {
  /** Current value. */
  value: number;
  /** Maximum value (defaults to 100). */
  max?: number;
  className?: string;
  indicatorClassName?: string;
  label?: string;
}

/** Accessible determinate progress bar. */
export function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  label,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500 ease-out',
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
