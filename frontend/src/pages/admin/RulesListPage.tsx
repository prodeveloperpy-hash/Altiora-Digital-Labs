import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import { useDeleteRule, useRules } from '@/features/admin/hooks';
import type { RecommendationRule } from '@/features/admin/types';
import type { RuleListParams } from '@/features/admin/api/adminApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

const OUTCOME_VARIANT = { pro: 'success', con: 'destructive', neutral: 'secondary' } as const;

export default function RulesListPage() {
  useDocumentTitle('Recommendation Rules');
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [outcome, setOutcome] = useState('');
  const [status, setStatus] = useState('');
  const debounced = useDebounce(search, 350);

  const params: RuleListParams = {
    search: debounced || undefined,
    outcome: outcome || undefined,
    isActive: status === '' ? undefined : status === 'active',
  };
  const { data: rules = [], isLoading } = useRules(params);
  const deleteRule = useDeleteRule();
  const [pendingDelete, setPendingDelete] = useState<RecommendationRule | null>(null);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRule.mutateAsync(pendingDelete.id);
      toast.success('Rule deleted', `“${pendingDelete.code}” was removed.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error('Delete failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  const columns: Column<RecommendationRule>[] = [
    {
      key: 'code',
      header: 'Rule',
      render: (rule) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{rule.code}</span>
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {rule.reasonLabel || rule.description || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'operator',
      header: 'Operator',
      render: (rule) => <code className="text-xs text-muted-foreground">{rule.operator}</code>,
    },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (rule) => (
        <Badge variant={OUTCOME_VARIANT[rule.outcome] ?? 'secondary'} className="capitalize">
          {rule.outcome}
        </Badge>
      ),
    },
    { key: 'points', header: 'Points', align: 'center', render: (r) => r.points },
    { key: 'weightKey', header: 'Weight', render: (r) => r.weightKey ?? '—' },
    { key: 'priority', header: 'Priority', align: 'center', render: (r) => r.priority },
    {
      key: 'isActive',
      header: 'Status',
      render: (rule) => (
        <Badge variant={rule.isActive ? 'success' : 'default'}>
          {rule.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (rule) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={ADMIN_ROUTES.ruleEdit(String(rule.id))}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={`Edit ${rule.code}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(rule)}
            aria-label={`Delete ${rule.code}`}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Recommendation Rules"
        description="The engine loads these rules from the database at request time — changing behavior is a data change, no code required."
        breadcrumbs={[
          { label: 'Dashboard', to: ADMIN_ROUTES.dashboard },
          { label: 'Recommendation Rules' },
        ]}
        actions={
          <Button onClick={() => navigate(ADMIN_ROUTES.ruleNew)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New rule
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules…"
            startAdornment={<Search className="h-4 w-4" />}
          />
        </div>
        <Select className="sm:w-40" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="">All outcomes</option>
          <option value="pro">Pro</option>
          <option value="con">Con</option>
          <option value="neutral">Neutral</option>
        </Select>
        <Select className="sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={rules}
        getRowId={(r) => String(r.id)}
        isLoading={isLoading}
        onRowClick={(r) => navigate(ADMIN_ROUTES.ruleEdit(String(r.id)))}
        emptyState={<p className="text-sm text-muted-foreground">No rules match your filters.</p>}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete rule"
        message={`Delete rule “${pendingDelete?.code}”? This immediately affects recommendations.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteRule.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
