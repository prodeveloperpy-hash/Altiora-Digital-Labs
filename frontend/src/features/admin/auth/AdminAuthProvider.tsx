import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '@/features/admin/api/adminApi';
import type { AdminProfileUpdatePayload, AdminRole, AdminUser } from '@/features/admin/types';
import { AdminAuthContext, ROLE_ORDER } from './AdminAuthContext';
import { tokenStore } from './tokenStore';

/**
 * Owns admin session state. Reads the persisted session on mount, verifies it
 * against the backend, and keeps in sync with the module-level token store (so
 * a silent refresh or a 401-triggered clear reflects immediately in the UI).
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => tokenStore.getSession()?.user ?? null);
  const [isInitializing, setIsInitializing] = useState<boolean>(() => Boolean(tokenStore.getSession()));

  // Reflect token-store changes (refresh, external clear) in React state.
  useEffect(() => {
    return tokenStore.subscribe((session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  // Validate any persisted session once on mount.
  useEffect(() => {
    let cancelled = false;
    const session = tokenStore.getSession();
    if (!session) {
      setIsInitializing(false);
      return;
    }
    authApi
      .me()
      .then((freshUser) => {
        if (cancelled) return;
        // Refresh the cached user in case role/name changed server-side.
        tokenStore.setSession({ ...session, user: freshUser });
        setUser(freshUser);
      })
      .catch(() => {
        if (cancelled) return;
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (username: string, password: string, remember: boolean) => {
      const result = await authApi.login(username, password, remember);
      tokenStore.setSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        remember,
      });
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      await authApi.logout(refreshToken);
    } catch {
      /* best-effort — always clear locally */
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload: AdminProfileUpdatePayload) => {
    const updatedUser = await authApi.updateProfile(payload);
    tokenStore.updateUser(updatedUser);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const hasRole = useCallback(
    (minimum: AdminRole) => {
      if (!user) return false;
      const userRank = ROLE_ORDER.indexOf(user.role);
      const minRank = ROLE_ORDER.indexOf(minimum);
      return userRank !== -1 && userRank <= minRank;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      updateProfile,
      hasRole,
    }),
    [user, isInitializing, login, logout, updateProfile, hasRole],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
