import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { GitCompareArrows, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ROUTES } from '@/config/constants';
import { useCompare } from '@/features/compare/context/useCompare';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: ROUTES.home, label: 'Home', end: true },
  { to: ROUTES.search, label: 'Browse cards', end: false },
  { to: ROUTES.questionnaire, label: 'Get matched', end: false },
  { to: ROUTES.about, label: 'About', end: false },
  { to: ROUTES.faq, label: 'FAQ', end: false },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCompare();
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      isActive
        ? 'bg-secondary text-foreground'
        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-colors duration-200',
        scrolled
          ? 'border-border bg-background/85 backdrop-blur-lg'
          : 'border-transparent bg-background',
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4" aria-label="Primary">
        <Link
          to={ROUTES.home}
          aria-label="Altiora Digital Labs home"
          className="inline-flex shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <img
            src="/logo.jpeg"
            alt="Altiora Digital Labs"
            className="h-12 w-12 rounded-lg object-contain sm:h-14 sm:w-14"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.compare}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Compare cards${count > 0 ? ` (${count} selected)` : ''}`}
          >
            <GitCompareArrows className="h-5 w-5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          <ThemeToggle />

          <Link
            to={ROUTES.questionnaire}
            className="hidden h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
          >
            Get matched
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={ROUTES.questionnaire}
              className="mt-1 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Get matched
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
