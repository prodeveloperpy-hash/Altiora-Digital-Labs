import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { normalizeError } from './apiError';

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

// Request interceptor — a natural seam for auth tokens, correlation IDs, etc.
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

// Response interceptor — unwrap the payload and normalize every error.
instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
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
