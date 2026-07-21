import { Link, NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES } from '@/config/constants';
import { ADMIN_NAV } from './adminNav';

interface AdminSidebarProps {
  /** Mobile drawer open state. */
  open: boolean;
  onClose: () => void;
}

/** Fixed left navigation. Static on desktop, a slide-over drawer on mobile. */
export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#08172D] text-white shadow-2xl transition-transform duration-[250ms] lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-5">
          <Link
            to={ADMIN_ROUTES.dashboard}
            aria-label="Altiora Digital Labs admin dashboard"
            className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src="/logo.jpeg"
              alt="Altiora Digital Labs"
              className="h-12 w-12 rounded-lg object-contain"
            />
            <span className="text-xs font-medium text-slate-300">Admin</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-[250ms]',
                    isActive
                      ? 'bg-[#11B5E4]/15 text-[#34C6F3] shadow-[inset_3px_0_0_#11B5E4]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 text-xs text-slate-400">
          Database-driven recommendations
        </div>
      </aside>
    </>
  );
}
