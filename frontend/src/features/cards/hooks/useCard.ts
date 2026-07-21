import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '@/features/cards/api/cardsApi';
import { queryKeys } from '@/lib/queryKeys';

/** Fetch a single card by id or slug. Disabled when no id is provided. */
export function useCard(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.cards.detail(id ?? ''),
    queryFn: ({ signal }) => cardsApi.getById(id as string, signal),
    enabled: Boolean(id),
  });
}
