import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { ROUTES, APP_NAME } from '@/config/constants';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

/** App wordmark linking home. */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      to={ROUTES.home}
      className={cn(
        'inline-flex items-center gap-2 rounded-md font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label={`${APP_NAME} home`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
        <CreditCard className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-lg">{APP_NAME}</span>
    </Link>
  );
}
