import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSearchInput } from '@/features/cards/components/CardSearchInput';
import { CardFilters } from '@/features/cards/components/CardFilters';
import { CardGrid } from '@/features/cards/components/CardGrid';
import { CardGridSkeleton } from '@/features/cards/components/CardSkeleton';
import { useCardFilters } from '@/features/cards/hooks/useCardFilters';
import { useCards } from '@/features/cards/hooks/useCards';
import { SORT_OPTIONS } from '@/features/cards/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pluralize } from '@/lib/utils';
import type { CardSortField } from '@/features/cards/types';

export default function SearchPage() {
  useDocumentTitle('Browse cards');
  const { filters, setFilter, clearFilters, activeFilterCount } = useCardFilters();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const query = useCards(filters);

  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 0;
  const cards = query.data?.items ?? [];

  return (
    <div className="container space-y-8 py-10 sm:py-14">
      <PageHeader
        title="Browse credit cards"
        description="Search and filter our full catalog to find cards that fit your needs."
      />

      {/* Search + sort toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CardSearchInput
            value={filters.search ?? ''}
            onDebouncedChange={(value) => setFilter({ search: value || undefined })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            variant="outline"
            className="w-full lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <div className="min-w-0 sm:w-48">
            <Select
              aria-label="Sort cards"
              value={filters.sort ?? 'recommended'}
              onChange={(e) => setFilter({ sort: e.target.value as CardSortField })}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <CardFilters
              filters={filters}
              onChange={setFilter}
              onClear={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </aside>

        <div className="space-y-6">
          {!query.isLoading && !query.isError && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {total} {pluralize(total, 'card')} found
              {query.isFetching && ' · updating…'}
            </p>
          )}

          {query.isLoading ? (
            <CardGridSkeleton count={6} />
          ) : query.isError ? (
            <ErrorState
              error={query.error}
              onRetry={() => query.refetch()}
              isRetrying={query.isFetching}
            />
          ) : cards.length === 0 ? (
            <EmptyState
              title="No cards match your filters"
              description="Try removing a filter or broadening your search."
              action={
                activeFilterCount > 0 || filters.search ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <CardGrid cards={cards} />
              <Pagination
                page={filters.page ?? 1}
                totalPages={totalPages}
                onPageChange={(page) => setFilter({ page })}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile filters modal */}
      <Modal
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filters"
        footer={
          <>
            <Button variant="ghost" onClick={clearFilters}>
              Clear all
            </Button>
            <Button onClick={() => setMobileFiltersOpen(false)}>Show results</Button>
          </>
        }
      >
        <CardFilters
          filters={filters}
          onChange={setFilter}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </Modal>
    </div>
  );
}
