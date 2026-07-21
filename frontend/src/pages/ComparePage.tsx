import { Link } from 'react-router-dom';
import { GitCompareArrows, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ComparisonTable } from '@/features/compare/components/ComparisonTable';
import { useCompare } from '@/features/compare/context/useCompare';
import { useCompareCards } from '@/features/cards/hooks/useCompareCards';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { MAX_COMPARE_CARDS, ROUTES } from '@/config/constants';

export default function ComparePage() {
  useDocumentTitle('Compare cards');
  const { ids, count, remove, clear } = useCompare();
  const query = useCompareCards(ids);

  if (count === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={GitCompareArrows}
          title="No cards to compare yet"
          description="Add cards to your comparison from the browse or recommendations pages, then see them side by side here."
          action={
            <Link
              to={ROUTES.search}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Browse cards to compare
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-10 sm:py-14">
      <PageHeader
        title="Compare cards"
        description={`Comparing ${count} of ${MAX_COMPARE_CARDS} cards side by side.`}
        actions={
          <div className="flex items-center gap-2">
            {count < MAX_COMPARE_CARDS && (
              <Link
                to={ROUTES.search}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-input bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add card
              </Link>
            )}
            <Button variant="ghost" onClick={clear}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear all
            </Button>
          </div>
        }
      />

      {query.isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !query.data || query.data.length === 0 ? (
        <EmptyState
          title="Unable to load selected cards"
          description="The selected cards could not be found. Try clearing and re-adding them."
          action={
            <Button variant="outline" onClick={clear}>
              Clear comparison
            </Button>
          }
        />
      ) : (
        <ComparisonTable cards={query.data} onRemove={remove} />
      )}
    </div>
  );
}
