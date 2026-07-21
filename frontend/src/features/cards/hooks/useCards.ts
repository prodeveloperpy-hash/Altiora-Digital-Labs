import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { cardsApi } from '@/features/cards/api/cardsApi';
import { queryKeys } from '@/lib/queryKeys';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import type { CardListParams } from '@/features/cards/types';

/** Fetch a paginated, filtered list of cards. Keeps previous data during refetch. */
export function useCards(params: CardListParams) {
  const normalized: CardListParams = {
    ...params,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
  };

  return useQuery({
    queryKey: queryKeys.cards.list(normalized),
    queryFn: ({ signal }) => cardsApi.list(normalized, signal),
    placeholderData: keepPreviousData,
  });
}
