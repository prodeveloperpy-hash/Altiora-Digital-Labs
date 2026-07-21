import { Spinner } from '@/components/ui/Spinner';

/** Suspense fallback shown while a lazily-loaded route chunk is downloading. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner size="lg" label="Loading page" />
      <p className="text-sm font-medium text-muted-foreground">Loading…</p>
    </div>
  );
}
