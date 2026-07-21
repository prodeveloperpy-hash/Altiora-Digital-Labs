import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '@/features/cards/api/cardsApi';
import { queryKeys } from '@/lib/queryKeys';

/** Fetch the curated set of featured cards for the home page. */
export function useFeaturedCards() {
  return useQuery({
    queryKey: queryKeys.cards.featured(),
    queryFn: ({ signal }) => cardsApi.featured(signal),
    staleTime: 5 * 60_000,
  });
}
