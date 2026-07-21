import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { isApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** The error to display. Accepts ApiError or any thrown value. */
  error?: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  compact?: boolean;
}

/** Consistent, friendly error panel used across data-driven views. */
export function ErrorState({
  error,
  title,
  description,
  onRetry,
  isRetrying = false,
  className,
  compact = false,
}: ErrorStateProps) {
  const networkError = isApiError(error) && error.isNetworkError;
  const resolvedTitle =
    title ?? (networkError ? 'Connection problem' : 'Something went wrong');
  const resolvedDescription =
    description ??
    (isApiError(error)
      ? error.message
      : 'We ran into an unexpected problem while loading this content.');

  const Icon = networkError ? WifiOff : AlertTriangle;

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card text-center',
        compact ? 'p-6' : 'p-10',
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{resolvedTitle}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{resolvedDescription}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} isLoading={isRetrying} loadingText="Retrying…">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
