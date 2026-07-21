import { useContext } from 'react';
import { AdminAuthContext, type AdminAuthContextValue } from './AdminAuthContext';

/** Access admin auth state and actions. Must be used within an AdminAuthProvider. */
export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
