import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/config/constants';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-10 w-10" aria-hidden="true" />
      </span>
      <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        This page took a wrong turn
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Let&rsquo;s get you
        back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to={ROUTES.home}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          Back home
        </Link>
        <Link
          to={ROUTES.search}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-input bg-card px-7 text-base font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Browse cards
        </Link>
      </div>
    </div>
  );
}
