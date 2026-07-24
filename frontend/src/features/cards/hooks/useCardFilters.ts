import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  CardCategory,
  CardNetwork,
  CardSortField,
  CreditScoreTier,
  CardListParams,
} from '@/features/cards/types';

/**
 * Reads and writes the card search/filter state from the URL query string, so
 * results are shareable and survive refreshes. Returns both the parsed filter
 * object and typed setters.
 */
export function useCardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CardListParams = useMemo(() => {
    const page = Number(searchParams.get('page'));
    const maxAnnualFee = searchParams.get('maxAnnualFee');
    return {
      search: searchParams.get('q') ?? undefined,
      category: (searchParams.get('category') as CardCategory | null) ?? undefined,
      network: (searchParams.get('network') as CardNetwork | null) ?? undefined,
      creditScore: (searchParams.get('creditScore') as CreditScoreTier | null) ?? undefined,
      maxAnnualFee: maxAnnualFee !== null ? Number(maxAnnualFee) : undefined,
      noAnnualFee: searchParams.get('noAnnualFee') === 'true' || undefined,
      bank: searchParams.get('bank') ?? undefined,
      fee: searchParams.get('fee') ?? undefined,
      benefits: searchParams.get('benefits')?.split(',').filter(Boolean),
      sort: (searchParams.get('sort') as CardSortField | null) ?? undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    };
  }, [searchParams]);

  /**
   * Update one or more filters. Any change other than an explicit page change
   * resets pagination back to page 1.
   */
  const setFilter = useCallback(
    (updates: Partial<CardListParams>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const apply = (key: string, value: unknown) => {
            if (value === undefined || value === null || value === '' || value === false) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          };

          if ('search' in updates) apply('q', updates.search);
          if ('category' in updates) apply('category', updates.category);
          if ('network' in updates) apply('network', updates.network);
          if ('creditScore' in updates) apply('creditScore', updates.creditScore);
          if ('maxAnnualFee' in updates) apply('maxAnnualFee', updates.maxAnnualFee);
          if ('noAnnualFee' in updates) apply('noAnnualFee', updates.noAnnualFee);
          if ('bank' in updates) apply('bank', updates.bank);
          if ('fee' in updates) apply('fee', updates.fee);
          if ('benefits' in updates) apply('benefits', updates.benefits?.join(','));
          if ('sort' in updates) apply('sort', updates.sort);

          if ('page' in updates) {
            apply('page', updates.page);
          } else {
            next.delete('page');
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.bank) count += 1;
    if (filters.fee) count += 1;
    count += filters.benefits?.length ?? 0;
    return count;
  }, [filters]);

  return { filters, setFilter, clearFilters, activeFilterCount };
}
