import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/config/constants';
import { useTheme } from '@/context/theme/useTheme';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { Button } from '@/components/ui/Button';

interface AdminTopbarProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

/** Top navigation bar: mobile menu toggle, theme switch, and account menu. */
export function AdminTopbar({ onMenuClick, onLogout }: AdminTopbarProps) {
  const { user } = useAdminAuth();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.fullName || user?.username || '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to={ROUTES.home}
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View site
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-secondary"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-medium text-foreground">
                {user?.fullName || user?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {user ? (ROLE_LABEL[user.role] ?? user.role) : ''}
              </span>
            </span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-elevated"
              >
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
