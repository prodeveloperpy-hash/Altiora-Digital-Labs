import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  isLoading?: boolean;
}

/** Compact KPI tile for the dashboard. */
export function StatCard({ label, value, hint, icon: Icon, isLoading = false }: StatCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
  );
}
