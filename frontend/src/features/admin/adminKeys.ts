import type { AdminCardListParams, RuleListParams } from '@/features/admin/api/adminApi';

/** TanStack Query key factory for admin resources (kept separate from the
 *  public storefront keys so admin caches invalidate independently). */
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  me: () => [...adminKeys.all, 'me'] as const,
  cards: {
    all: [...['admin'], 'cards'] as const,
    list: (params: AdminCardListParams) => [...adminKeys.cards.all, 'list', params] as const,
    detail: (id: string) => [...adminKeys.cards.all, 'detail', id] as const,
  },
  banks: {
    all: [...['admin'], 'banks'] as const,
    list: (search?: string) => [...adminKeys.banks.all, 'list', search ?? ''] as const,
    detail: (id: string) => [...adminKeys.banks.all, 'detail', id] as const,
  },
  categories: {
    all: [...['admin'], 'categories'] as const,
    list: () => [...adminKeys.categories.all, 'list'] as const,
  },
  questions: {
    all: [...['admin'], 'questions'] as const,
    list: () => [...adminKeys.questions.all, 'list'] as const,
    detail: (id: string) => [...adminKeys.questions.all, 'detail', id] as const,
  },
  rules: {
    all: [...['admin'], 'rules'] as const,
    list: (params: RuleListParams) => [...adminKeys.rules.all, 'list', params] as const,
    detail: (id: number) => [...adminKeys.rules.all, 'detail', id] as const,
    catalog: () => [...adminKeys.rules.all, 'catalog'] as const,
  },
  settings: {
    all: [...['admin'], 'settings'] as const,
    list: () => [...adminKeys.settings.all, 'list'] as const,
  },
} as const;
