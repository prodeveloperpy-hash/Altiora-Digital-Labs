import type { CardListParams } from '@/features/cards/types';
import type { QuestionnaireAnswers } from '@/features/questionnaire/types';

/**
 * Centralized TanStack Query key factory. Using a single factory keeps cache
 * keys consistent across hooks and makes targeted invalidation straightforward.
 */
export const queryKeys = {
  cards: {
    all: ['cards'] as const,
    lists: () => [...queryKeys.cards.all, 'list'] as const,
    list: (params: CardListParams) => [...queryKeys.cards.lists(), params] as const,
    featured: () => [...queryKeys.cards.all, 'featured'] as const,
    details: () => [...queryKeys.cards.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cards.details(), id] as const,
    compare: (ids: string[]) => [...queryKeys.cards.all, 'compare', [...ids].sort()] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
    forAnswers: (answers: QuestionnaireAnswers) =>
      [...queryKeys.recommendations.all, answers] as const,
  },
  faqs: {
    all: ['faqs'] as const,
  },
} as const;
