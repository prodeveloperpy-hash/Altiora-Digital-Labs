import { Link } from 'react-router-dom';
import { GitCompareArrows, X, Trash2 } from 'lucide-react';
import { useCompare } from '@/features/compare/context/useCompare';
import { MAX_COMPARE_CARDS, ROUTES } from '@/config/constants';
import { Button } from '@/components/ui/Button';
import { pluralize } from '@/lib/utils';

/**
 * Sticky bottom tray that surfaces the current comparison selection from any
 * page and links through to the full comparison view.
 */
export function CompareTray() {
  const { items, count, remove, clear } = useCompare();

  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4">
      <div className="pointer-events-auto container animate-fade-in-up">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-elevated backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitCompareArrows className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {count} of {MAX_COMPARE_CARDS} {pluralize(count, 'card')} selected
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {item.name}
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name} from comparison`}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
            <Link
              to={ROUTES.compare}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Compare
              {count >= 2 ? ' now' : ''}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
