import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminCardsApi,
  adminCategoriesApi,
  banksApi,
  dashboardApi,
  questionsApi,
  rulesApi,
  settingsApi,
  type AdminCardListParams,
  type RuleListParams,
} from '@/features/admin/api/adminApi';
import { adminKeys } from '@/features/admin/adminKeys';
import type {
  BankWritePayload,
  CardWritePayload,
  QuestionWritePayload,
  RuleWritePayload,
} from '@/features/admin/types';

// --- Dashboard -----------------------------------------------------------
export function useDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => dashboardApi.get(),
  });
}

// --- Cards ---------------------------------------------------------------
export function useAdminCards(params: AdminCardListParams) {
  return useQuery({
    queryKey: adminKeys.cards.list(params),
    queryFn: () => adminCardsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCard(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.cards.detail(id ?? ''),
    queryFn: () => adminCardsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CardWritePayload) => adminCardsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.cards.all }),
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CardWritePayload> }) =>
      adminCardsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.cards.all }),
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCardsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.cards.all }),
  });
}

export function useSetCardPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? adminCardsApi.publish(id) : adminCardsApi.unpublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.cards.all }),
  });
}

// --- Banks ---------------------------------------------------------------
export function useBanks(search?: string) {
  return useQuery({
    queryKey: adminKeys.banks.list(search),
    queryFn: () => banksApi.list(search),
    placeholderData: keepPreviousData,
  });
}

export function useBank(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.banks.detail(id ?? ''),
    queryFn: () => banksApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BankWritePayload) => banksApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.banks.all }),
  });
}

export function useUpdateBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BankWritePayload> }) =>
      banksApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.banks.all }),
  });
}

export function useDeleteBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => banksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.banks.all }),
  });
}

// --- Categories ----------------------------------------------------------
export function useAdminCategories() {
  return useQuery({
    queryKey: adminKeys.categories.list(),
    queryFn: () => adminCategoriesApi.list(),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { slug: string; name: string; description: string }) =>
      adminCategoriesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.categories.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, payload }: { slug: string; payload: { name?: string; description?: string } }) =>
      adminCategoriesApi.update(slug, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.categories.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => adminCategoriesApi.remove(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.categories.all }),
  });
}

// --- Questions -----------------------------------------------------------
export function useQuestions() {
  return useQuery({
    queryKey: adminKeys.questions.list(),
    queryFn: () => questionsApi.list(),
  });
}

export function useQuestion(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.questions.detail(id ?? ''),
    queryFn: () => questionsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: QuestionWritePayload) => questionsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.questions.all }),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<QuestionWritePayload> }) =>
      questionsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.questions.all }),
  });
}

export function useReorderQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => questionsApi.reorder(ids),
    onSuccess: (data) => qc.setQueryData(adminKeys.questions.list(), data),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.questions.all }),
  });
}

// --- Recommendation rules ------------------------------------------------
export function useRules(params: RuleListParams) {
  return useQuery({
    queryKey: adminKeys.rules.list(params),
    queryFn: () => rulesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useRule(id: number | undefined) {
  return useQuery({
    queryKey: adminKeys.rules.detail(id ?? -1),
    queryFn: () => rulesApi.get(id as number),
    enabled: typeof id === 'number' && id > 0,
  });
}

export function useRuleCatalog() {
  return useQuery({
    queryKey: adminKeys.rules.catalog(),
    queryFn: () => rulesApi.catalog(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RuleWritePayload) => rulesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.rules.all }),
  });
}

export function useUpdateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RuleWritePayload> }) =>
      rulesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.rules.all }),
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rulesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.rules.all }),
  });
}

// --- Settings ------------------------------------------------------------
export function useSettings() {
  return useQuery({
    queryKey: adminKeys.settings.list(),
    queryFn: () => settingsApi.list(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, unknown>) => settingsApi.updateMany(values),
    onSuccess: (data) => qc.setQueryData(adminKeys.settings.list(), data),
  });
}
