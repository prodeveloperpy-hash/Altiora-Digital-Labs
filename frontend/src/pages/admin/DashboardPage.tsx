import { Link } from 'react-router-dom';
import {
  Activity,
  CreditCard,
  Landmark,
  ListChecks,
  SlidersHorizontal,
  Tags,
} from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import { useDashboard } from '@/features/admin/hooks';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/feedback/ErrorState';

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const ACTION_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'primary' | 'default'> = {
  created: 'success',
  published: 'success',
  updated: 'primary',
  unpublished: 'warning',
  deleted: 'destructive',
  login: 'default',
  logout: 'default',
};

export default function DashboardPage() {
  useDocumentTitle('Admin Dashboard');
  const { user } = useAdminAuth();
  const { data, isLoading, isError, refetch } = useDashboard();
  const stats = data?.stats;

  return (
    <>
      <AdminPageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || user?.username || 'Admin'}`}
        description="An overview of your recommendation platform."
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {isError ? (
        <ErrorState
          title="Could not load the dashboard"
          description="There was a problem fetching your statistics."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Cards"
              value={stats?.totalCards ?? 0}
              hint={`${stats?.activeCards ?? 0} published`}
              icon={CreditCard}
              isLoading={isLoading}
            />
            <StatCard
              label="Total Banks"
              value={stats?.totalBanks ?? 0}
              icon={Landmark}
              isLoading={isLoading}
            />
            <StatCard
              label="Total Questions"
              value={stats?.totalQuestions ?? 0}
              icon={ListChecks}
              isLoading={isLoading}
            />
            <StatCard
              label="Recommendation Rules"
              value={stats?.totalRules ?? 0}
              hint={`${stats?.activeRules ?? 0} active`}
              icon={SlidersHorizontal}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-xl border border-border bg-card">
              <header className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
              </header>
              <div className="divide-y divide-border">
                {isLoading && (
                  <div className="space-y-3 p-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-5 w-full animate-pulse rounded bg-muted" />
                    ))}
                  </div>
                )}
                {!isLoading && data && data.recentActivity.length === 0 && (
                  <p className="p-5 text-sm text-muted-foreground">No activity recorded yet.</p>
                )}
                {!isLoading &&
                  data?.recentActivity.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                      <Badge variant={ACTION_VARIANT[entry.action] ?? 'default'} className="capitalize">
                        {entry.action}
                      </Badge>
                      <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {entry.summary}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(entry.createdAt)}
                      </span>
                    </div>
                  ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Quick actions</h2>
              <div className="grid grid-cols-1 gap-2">
                <QuickLink to={ADMIN_ROUTES.cardNew} icon={CreditCard} label="Add a new card" />
                <QuickLink to={ADMIN_ROUTES.bankNew} icon={Landmark} label="Add a bank" />
                <QuickLink to={ADMIN_ROUTES.questionNew} icon={ListChecks} label="Add a question" />
                <QuickLink to={ADMIN_ROUTES.ruleNew} icon={SlidersHorizontal} label="Add a rule" />
                <QuickLink to={ADMIN_ROUTES.categoryNew} icon={Tags} label="Add a category" />
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof CreditCard;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      {label}
    </Link>
  );
}
