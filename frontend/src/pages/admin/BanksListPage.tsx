import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import { useBanks, useDeleteBank } from '@/features/admin/hooks';
import type { Bank } from '@/features/admin/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function BanksListPage() {
  useDocumentTitle('Banks');
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 350);
  const { data: banks = [], isLoading } = useBanks(debounced || undefined);
  const deleteBank = useDeleteBank();
  const [pendingDelete, setPendingDelete] = useState<Bank | null>(null);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBank.mutateAsync(pendingDelete.id);
      toast.success('Bank deleted', `“${pendingDelete.name}” was removed.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error('Delete failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  const columns: Column<Bank>[] = [
    {
      key: 'name',
      header: 'Bank',
      render: (bank) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{bank.name}</span>
          <span className="text-xs text-muted-foreground">{bank.slug}</span>
        </div>
      ),
    },
    {
      key: 'website',
      header: 'Website',
      render: (bank) =>
        bank.website ? (
          <a
            href={bank.website}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {bank.website.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: 'cardCount', header: 'Cards', align: 'center', render: (b) => b.cardCount },
    {
      key: 'isActive',
      header: 'Status',
      render: (bank) => (
        <Badge variant={bank.isActive ? 'success' : 'default'}>
          {bank.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (bank) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={ADMIN_ROUTES.bankEdit(bank.id)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={`Edit ${bank.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(bank)}
            aria-label={`Delete ${bank.name}`}
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
        title="Banks"
        description="Manage the card issuers available across the platform."
        breadcrumbs={[{ label: 'Dashboard', to: ADMIN_ROUTES.dashboard }, { label: 'Banks' }]}
        actions={
          <Button onClick={() => navigate(ADMIN_ROUTES.bankNew)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New bank
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search banks…"
          startAdornment={<Search className="h-4 w-4" />}
        />
      </div>

      <DataTable
        columns={columns}
        rows={banks}
        getRowId={(b) => b.id}
        isLoading={isLoading}
        onRowClick={(b) => navigate(ADMIN_ROUTES.bankEdit(b.id))}
        emptyState={<p className="text-sm text-muted-foreground">No banks yet. Create your first one.</p>}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete bank"
        message={`Delete “${pendingDelete?.name}”? Cards from this bank will be kept but unlinked.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteBank.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
