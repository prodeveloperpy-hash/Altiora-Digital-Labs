import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '@/features/cards/api/cardsApi';
import { queryKeys } from '@/lib/queryKeys';

/** Fetch card categories with their card counts (used in filters and browsing). */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: ({ signal }) => cardsApi.categories(signal),
    staleTime: 10 * 60_000,
  });
}
