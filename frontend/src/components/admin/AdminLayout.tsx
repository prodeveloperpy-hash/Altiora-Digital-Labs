import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ADMIN_ROUTES } from '@/config/constants';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { useToast } from '@/context/toast/useToast';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

/** The authenticated admin shell: sidebar + topbar + routed content. */
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out', 'You have been signed out of the admin panel.');
    navigate(ADMIN_ROUTES.login, { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
