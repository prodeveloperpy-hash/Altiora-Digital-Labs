import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/constants';

export function Breadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === ROUTES.home || pathname.startsWith('/admin')) return null;
  const parts = pathname.split('/').filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="container pt-5 text-sm text-muted-foreground">
      <ol className="flex flex-wrap gap-2">
        <li><Link to={ROUTES.home} className="hover:text-primary">Home</Link></li>
        {parts.map((part, index) => {
          const to = `/${parts.slice(0, index + 1).join('/')}`;
          const current = index === parts.length - 1;
          return <li key={to} className="flex gap-2"><span>/</span>{current
            ? <span aria-current="page" className="capitalize text-foreground">{decodeURIComponent(part).replaceAll('-', ' ')}</span>
            : <Link to={to} className="capitalize hover:text-primary">{part.replaceAll('-', ' ')}</Link>}</li>;
        })}
      </ol>
    </nav>
  );
}
