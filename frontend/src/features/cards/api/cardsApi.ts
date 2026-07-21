import { apiClient } from '@/lib/apiClient';
import type { PaginatedResponse } from '@/types/api';
import type { Category, CardListParams, CreditCard } from '@/features/cards/types';

/**
 * Card API surface. These call the backend endpoints (assumed to exist):
 *   GET  /cards                 → paginated, filterable card list & search
 *   GET  /cards/featured        → curated featured cards for the home page
 *   GET  /cards/compare?ids=…   → full details for a set of cards
 *   GET  /cards/:id             → a single card by id or slug
 *   GET  /categories            → card categories with counts
 */

/** Serialize list params into a clean query object (omitting empty values). */
function toQuery(params: CardListParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  if (params.search) query.search = params.search;
  if (params.category) query.category = params.category;
  if (params.network) query.network = params.network;
  if (params.creditScore) query.creditScore = params.creditScore;
  if (typeof params.maxAnnualFee === 'number') query.maxAnnualFee = params.maxAnnualFee;
  if (params.noAnnualFee) query.noAnnualFee = true;
  if (params.sort) query.sort = params.sort;
  if (params.direction) query.direction = params.direction;
  if (params.page) query.page = params.page;
  if (params.pageSize) query.pageSize = params.pageSize;
  return query;
}

export const cardsApi = {
  list(params: CardListParams, signal?: AbortSignal): Promise<PaginatedResponse<CreditCard>> {
    return apiClient.get<PaginatedResponse<CreditCard>>('/cards', {
      params: toQuery(params),
      signal,
    });
  },

  featured(signal?: AbortSignal): Promise<CreditCard[]> {
    return apiClient.get<CreditCard[]>('/cards/featured', { signal });
  },

  getById(id: string, signal?: AbortSignal): Promise<CreditCard> {
    return apiClient.get<CreditCard>(`/cards/${encodeURIComponent(id)}`, { signal });
  },

  compare(ids: string[], signal?: AbortSignal): Promise<CreditCard[]> {
    return apiClient.get<CreditCard[]>('/cards/compare', {
      params: { ids: ids.join(',') },
      signal,
    });
  },

  categories(signal?: AbortSignal): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories', { signal });
  },
};
