import { createContext } from 'react';
import type { AdminProfileUpdatePayload, AdminRole, AdminUser } from '@/features/admin/types';

export interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  /** True while the initial session check is in flight. */
  isInitializing: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: AdminProfileUpdatePayload) => Promise<AdminUser>;
  /** True when the current user's role meets or exceeds `minimum`. */
  hasRole: (minimum: AdminRole) => boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

// Ordered most → least privileged; lower index == more privilege.
export const ROLE_ORDER: AdminRole[] = ['super_admin', 'admin', 'editor'];
