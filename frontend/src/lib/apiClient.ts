import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { normalizeError } from './apiError';
import { tokenStore } from '@/features/admin/auth/tokenStore';

/**
 * Shared Axios instance. All feature API modules import this rather than axios
 * directly, so timeout, base URL, headers, and error normalization are applied
 * in exactly one place.
 */
const instance: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// A bare instance used only to refresh tokens, so it never re-enters the
// interceptor chain below (which would recurse on a failed refresh).
const refreshInstance: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// Request interceptor — attach the admin bearer token when present.
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// De-duplicate concurrent refreshes: the first 401 kicks off a refresh, and any
// other 401s that arrive meanwhile await the same in-flight promise.
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await refreshInstance.post<{ accessToken: string; refreshToken: string }>(
    '/admin/auth/refresh',
    { refreshToken },
  );
  tokenStore.updateTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

function shouldAttemptRefresh(config: RetriableConfig | undefined): boolean {
  if (!config || config._retry) return false;
  const url = config.url ?? '';
  // Only admin requests carry a session; never try to refresh the auth calls.
  if (!url.includes('/admin/')) return false;
  if (url.includes('/admin/auth/')) return false;
  return Boolean(tokenStore.getRefreshToken());
}

// Response interceptor — transparently refresh once on 401, else normalize.
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && shouldAttemptRefresh(config)) {
      try {
        refreshPromise = refreshPromise ?? performRefresh();
        const newToken = await refreshPromise;
        refreshPromise = null;
        config!._retry = true;
        config!.headers.set('Authorization', `Bearer ${newToken}`);
        return instance.request(config!);
      } catch (refreshError) {
        refreshPromise = null;
        tokenStore.clear();
        return Promise.reject(normalizeError(refreshError));
      }
    }
    return Promise.reject(normalizeError(error));
  },
);

/**
 * Thin, typed wrapper around the Axios instance. Each method returns the parsed
 * response body directly (not the AxiosResponse envelope), which keeps feature
 * code focused on domain data.
 */
export const apiClient = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get<T>(url, config).then((r) => r.data);
  },
  post<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    return instance.post<T>(url, body, config).then((r) => r.data);
  },
  put<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    return instance.put<T>(url, body, config).then((r) => r.data);
  },
  patch<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    return instance.patch<T>(url, body, config).then((r) => r.data);
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete<T>(url, config).then((r) => r.data);
  },
};

export { instance as axiosInstance };
