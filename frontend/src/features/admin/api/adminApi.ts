import { apiClient, axiosInstance } from '@/lib/apiClient';
import type { PaginatedResponse } from '@/types/api';
import type {
  ActivityEntry,
  AdminProfileUpdatePayload,
  AdminUser,
  AdminCard,
  AdminCategory,
  Bank,
  BankWritePayload,
  CardWritePayload,
  DashboardResponse,
  LoginResponse,
  OperatorCatalog,
  Question,
  QuestionWritePayload,
  RecommendationRule,
  RuleWritePayload,
  Setting,
  UploadResponse,
} from '@/features/admin/types';

/**
 * Admin API surface. Every path is relative to the `/api` base and lives under
 * `/admin`, matching the JWT-protected backend router. The shared Axios instance
 * attaches the bearer token and transparently refreshes it on 401.
 */

// --- Auth ----------------------------------------------------------------
export const authApi = {
  login(username: string, password: string, remember: boolean): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/admin/auth/login', { username, password, remember });
  },
  logout(refreshToken: string | null): Promise<{ status: string }> {
    return apiClient.post<{ status: string }>('/admin/auth/logout', { refreshToken });
  },
  me(): Promise<LoginResponse['user']> {
    return apiClient.get<LoginResponse['user']>('/admin/auth/me');
  },
  updateProfile(payload: AdminProfileUpdatePayload): Promise<AdminUser> {
    return apiClient.patch<AdminUser>('/admin/auth/me', payload);
  },
  listAdmins(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>('/admin/auth/admins');
  },
  createAdmin(payload: { email: string; password: string }): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/auth/admins', payload);
  },
  updateAdminPassword(id: string, password: string): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/admin/auth/admins/${encodeURIComponent(id)}/password`, {
      password,
    });
  },
  deleteAdmin(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/auth/admins/${encodeURIComponent(id)}`);
  },
};

// --- Dashboard -----------------------------------------------------------
export const dashboardApi = {
  get(activityLimit = 10): Promise<DashboardResponse> {
    return apiClient.get<DashboardResponse>('/admin/dashboard', { params: { activityLimit } });
  },
};

// --- Cards ---------------------------------------------------------------
export interface AdminCardListParams {
  search?: string;
  category?: string;
  network?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const adminCardsApi = {
  list(params: AdminCardListParams): Promise<PaginatedResponse<AdminCard>> {
    return apiClient.get<PaginatedResponse<AdminCard>>('/admin/cards', { params });
  },
  get(id: string): Promise<AdminCard> {
    return apiClient.get<AdminCard>(`/admin/cards/${encodeURIComponent(id)}`);
  },
  create(payload: CardWritePayload): Promise<AdminCard> {
    return apiClient.post<AdminCard>('/admin/cards', payload);
  },
  update(id: string, payload: Partial<CardWritePayload>): Promise<AdminCard> {
    return apiClient.patch<AdminCard>(`/admin/cards/${encodeURIComponent(id)}`, payload);
  },
  publish(id: string): Promise<AdminCard> {
    return apiClient.post<AdminCard>(`/admin/cards/${encodeURIComponent(id)}/publish`);
  },
  unpublish(id: string): Promise<AdminCard> {
    return apiClient.post<AdminCard>(`/admin/cards/${encodeURIComponent(id)}/unpublish`);
  },
  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/cards/${encodeURIComponent(id)}`);
  },
};

// --- Banks ---------------------------------------------------------------
export const banksApi = {
  list(search?: string): Promise<Bank[]> {
    return apiClient.get<Bank[]>('/admin/banks', { params: search ? { search } : undefined });
  },
  get(id: string): Promise<Bank> {
    return apiClient.get<Bank>(`/admin/banks/${encodeURIComponent(id)}`);
  },
  create(payload: BankWritePayload): Promise<Bank> {
    return apiClient.post<Bank>('/admin/banks', payload);
  },
  update(id: string, payload: Partial<BankWritePayload>): Promise<Bank> {
    return apiClient.patch<Bank>(`/admin/banks/${encodeURIComponent(id)}`, payload);
  },
  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/banks/${encodeURIComponent(id)}`);
  },
};

// --- Categories ----------------------------------------------------------
export const adminCategoriesApi = {
  list(): Promise<AdminCategory[]> {
    return apiClient.get<AdminCategory[]>('/admin/categories');
  },
  create(payload: { slug: string; name: string; description: string }): Promise<AdminCategory> {
    return apiClient.post<AdminCategory>('/admin/categories', payload);
  },
  update(
    slug: string,
    payload: { name?: string; description?: string },
  ): Promise<AdminCategory> {
    return apiClient.patch<AdminCategory>(`/admin/categories/${encodeURIComponent(slug)}`, payload);
  },
  remove(slug: string): Promise<void> {
    return apiClient.delete<void>(`/admin/categories/${encodeURIComponent(slug)}`);
  },
};

// --- Questions -----------------------------------------------------------
export const questionsApi = {
  list(): Promise<Question[]> {
    return apiClient.get<Question[]>('/admin/questions');
  },
  get(id: string): Promise<Question> {
    return apiClient.get<Question>(`/admin/questions/${encodeURIComponent(id)}`);
  },
  create(payload: QuestionWritePayload): Promise<Question> {
    return apiClient.post<Question>('/admin/questions', payload);
  },
  update(id: string, payload: Partial<QuestionWritePayload>): Promise<Question> {
    return apiClient.patch<Question>(`/admin/questions/${encodeURIComponent(id)}`, payload);
  },
  reorder(ids: string[]): Promise<Question[]> {
    return apiClient.post<Question[]>('/admin/questions/reorder', { ids });
  },
  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/questions/${encodeURIComponent(id)}`);
  },
};

// --- Recommendation rules ------------------------------------------------
export interface RuleListParams {
  search?: string;
  outcome?: string;
  isActive?: boolean;
}

export const rulesApi = {
  list(params: RuleListParams = {}): Promise<RecommendationRule[]> {
    return apiClient.get<RecommendationRule[]>('/admin/recommendation-rules', { params });
  },
  catalog(): Promise<OperatorCatalog> {
    return apiClient.get<OperatorCatalog>('/admin/recommendation-rules/catalog');
  },
  get(id: number): Promise<RecommendationRule> {
    return apiClient.get<RecommendationRule>(`/admin/recommendation-rules/${id}`);
  },
  create(payload: RuleWritePayload): Promise<RecommendationRule> {
    return apiClient.post<RecommendationRule>('/admin/recommendation-rules', payload);
  },
  update(id: number, payload: Partial<RuleWritePayload>): Promise<RecommendationRule> {
    return apiClient.patch<RecommendationRule>(`/admin/recommendation-rules/${id}`, payload);
  },
  remove(id: number): Promise<void> {
    return apiClient.delete<void>(`/admin/recommendation-rules/${id}`);
  },
};

// --- Settings ------------------------------------------------------------
export const settingsApi = {
  list(): Promise<Setting[]> {
    return apiClient.get<Setting[]>('/admin/settings');
  },
  updateMany(values: Record<string, unknown>): Promise<Setting[]> {
    return apiClient.put<Setting[]>('/admin/settings', { values });
  },
};

// --- Uploads -------------------------------------------------------------
export const uploadApi = {
  async image(file: File): Promise<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    // Axios strips the Content-Type for FormData in the browser so the boundary
    // is set correctly; the auth token is still attached by the interceptor.
    const { data } = await axiosInstance.post<UploadResponse>('/admin/uploads', form);
    return data;
  },
};

export type { ActivityEntry };
