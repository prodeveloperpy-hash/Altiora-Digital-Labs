import { STORAGE_KEYS } from '@/config/constants';
import type { AdminUser } from '@/features/admin/types';

/**
 * Framework-agnostic admin token store. Lives outside React so the shared Axios
 * instance can read/refresh tokens without importing component state.
 *
 * "Remember me" chooses the backing store: localStorage persists across browser
 * restarts, sessionStorage clears when the tab closes. A subscriber callback lets
 * the React auth context re-render when tokens change (e.g. after a refresh).
 */

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
  remember: boolean;
}

type Listener = (session: AdminSession | null) => void;

const listeners = new Set<Listener>();

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function storeFor(remember: boolean): Storage | null {
  try {
    return remember ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Read the persisted "remember" preference to know which store holds the session. */
function activeStore(): Storage | null {
  try {
    if (window.localStorage.getItem(STORAGE_KEYS.adminAccessToken)) return window.localStorage;
    if (window.sessionStorage.getItem(STORAGE_KEYS.adminAccessToken)) return window.sessionStorage;
  } catch {
    return null;
  }
  return null;
}

function clearBoth(): void {
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      store.removeItem(STORAGE_KEYS.adminAccessToken);
      store.removeItem(STORAGE_KEYS.adminRefreshToken);
      store.removeItem(STORAGE_KEYS.adminUser);
      store.removeItem(STORAGE_KEYS.adminRemember);
    } catch {
      /* storage unavailable */
    }
  }
}

export const tokenStore = {
  getAccessToken(): string | null {
    return activeStore()?.getItem(STORAGE_KEYS.adminAccessToken) ?? null;
  },

  getRefreshToken(): string | null {
    return activeStore()?.getItem(STORAGE_KEYS.adminRefreshToken) ?? null;
  },

  getSession(): AdminSession | null {
    const store = activeStore();
    if (!store) return null;
    const accessToken = store.getItem(STORAGE_KEYS.adminAccessToken);
    const refreshToken = store.getItem(STORAGE_KEYS.adminRefreshToken);
    const user = safeParse<AdminUser>(store.getItem(STORAGE_KEYS.adminUser));
    if (!accessToken || !refreshToken || !user) return null;
    return {
      accessToken,
      refreshToken,
      user,
      remember: store === window.localStorage,
    };
  },

  setSession(session: AdminSession): void {
    clearBoth();
    const store = storeFor(session.remember);
    if (!store) return;
    store.setItem(STORAGE_KEYS.adminAccessToken, session.accessToken);
    store.setItem(STORAGE_KEYS.adminRefreshToken, session.refreshToken);
    store.setItem(STORAGE_KEYS.adminUser, JSON.stringify(session.user));
    store.setItem(STORAGE_KEYS.adminRemember, String(session.remember));
    this.notify();
  },

  /** Update just the tokens after a refresh, preserving user + remember store. */
  updateTokens(accessToken: string, refreshToken: string): void {
    const store = activeStore();
    if (!store) return;
    store.setItem(STORAGE_KEYS.adminAccessToken, accessToken);
    store.setItem(STORAGE_KEYS.adminRefreshToken, refreshToken);
    this.notify();
  },

  updateUser(user: AdminUser): void {
    const store = activeStore();
    if (!store) return;
    store.setItem(STORAGE_KEYS.adminUser, JSON.stringify(user));
    this.notify();
  },

  clear(): void {
    clearBoth();
    this.notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify(): void {
    const session = this.getSession();
    listeners.forEach((listener) => listener(session));
  },
};
