import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  label?: string;
  className?: string;
  /** Fill the viewport height (used for full-page route loading). */
  fullPage?: boolean;
}

/** Centered spinner with a label for indeterminate loading. */
export function LoadingState({ label = 'Loading…', className, fullPage = false }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-muted-foreground',
        fullPage ? 'min-h-[60vh]' : 'py-16',
        className,
      )}
    >
      <Spinner size="lg" label={label} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
