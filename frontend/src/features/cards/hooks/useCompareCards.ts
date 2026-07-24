import { useQuery } from '@tanstack/react-query';
import { cardsApi } from '@/features/cards/api/cardsApi';
import { queryKeys } from '@/lib/queryKeys';

/** Fetch full card details for the set of ids currently in the comparison tray. */
export function useCompareCards(ids: string[]) {
  return useQuery({
    queryKey: queryKeys.cards.compare(ids),
    queryFn: ({ signal }) => cardsApi.compare(ids, signal),
    enabled: ids.length === 2,
  });
}
