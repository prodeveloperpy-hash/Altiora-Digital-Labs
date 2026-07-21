import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

/** Consistent page heading block used at the top of content pages. */
export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-none items-center gap-3">{actions}</div>}
    </div>
  );
}
