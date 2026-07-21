import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ADMIN_ROUTES } from '@/config/constants';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Guards the admin area. While the persisted session is being verified a spinner
 * is shown; unauthenticated users are redirected to the login page with the
 * originally requested location preserved for post-login return.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAdminAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="xl" label="Checking your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ADMIN_ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
