/**
 * Centralized, typed access to environment configuration.
 * All `import.meta.env` reads happen here so the rest of the app depends on a
 * single, validated source of truth.
 */

function readString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  /** Base URL prefixed to every API request. */
  apiBaseUrl: readString(import.meta.env.VITE_API_BASE_URL, '/api'),
  /** Axios request timeout in milliseconds. */
  apiTimeout: readNumber(import.meta.env.VITE_API_TIMEOUT, 15000),
  /** Human-readable application name. */
  appName: readString(import.meta.env.VITE_APP_NAME, 'CardWise'),
  /** True when running the Vite dev server. */
  isDev: import.meta.env.DEV,
  /** True in production builds. */
  isProd: import.meta.env.PROD,
} as const;

export type Env = typeof env;
