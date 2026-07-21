import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import {
  useAdminCards,
  useDeleteCard,
  useSetCardPublished,
} from '@/features/admin/hooks';
import type { AdminCard } from '@/features/admin/types';
import type { AdminCardListParams } from '@/features/admin/api/adminApi';
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
import { Pagination } from '@/components/ui/Pagination';

const NETWORKS = ['visa', 'mastercard', 'amex', 'discover'];

function formatCurrency(value: number): string {
  return value === 0 ? 'No fee' : `$${value.toLocaleString()}`;
}

export default function CardsListPage() {
  useDocumentTitle('Cards');
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'name',
    direction: 'asc',
  });
  const debounced = useDebounce(search, 350);

  const params: AdminCardListParams = {
    search: debounced || undefined,
    network: network || undefined,
    sort: sort.field,
    direction: sort.direction,
    page,
    pageSize: 15,
  };
  const { data, isLoading } = useAdminCards(params);

  const deleteCard = useDeleteCard();
  const setPublished = useSetCardPublished();
  const [pendingDelete, setPendingDelete] = useState<AdminCard | null>(null);

  const handleSort = (field: string) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' },
    );
    setPage(1);
  };

  const togglePublish = async (card: AdminCard) => {
    try {
      await setPublished.mutateAsync({ id: card.id, publish: !card.isActive });
      toast.success(
        card.isActive ? 'Card unpublished' : 'Card published',
        `“${card.name}” is now ${card.isActive ? 'hidden' : 'visible'}.`,
      );
    } catch (error) {
      toast.error('Action failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCard.mutateAsync(pendingDelete.id);
      toast.success('Card deleted', `“${pendingDelete.name}” was removed.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error('Delete failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  const columns: Column<AdminCard>[] = [
    {
      key: 'name',
      header: 'Card',
      sortField: 'name',
      render: (card) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
            {card.imageUrl ? (
              <img src={card.imageUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[10px] uppercase text-muted-foreground">{card.network}</span>
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">{card.name}</span>
            <span className="truncate text-xs text-muted-foreground">{card.issuer}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (card) => (
        <div className="flex flex-wrap gap-1">
          {card.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="secondary" className="capitalize">
              {c.replace(/-/g, ' ')}
            </Badge>
          ))}
          {card.categories.length > 2 && (
            <Badge variant="default">+{card.categories.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'annualFee',
      header: 'Annual fee',
      sortField: 'annualFee',
      render: (card) => formatCurrency(card.annualFee),
    },
    { key: 'rating', header: 'Rating', sortField: 'rating', render: (card) => card.rating.toFixed(1) },
    {
      key: 'isActive',
      header: 'Status',
      render: (card) => (
        <Badge variant={card.isActive ? 'success' : 'default'}>
          {card.isActive ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (card) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => togglePublish(card)}
            aria-label={card.isActive ? `Unpublish ${card.name}` : `Publish ${card.name}`}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {card.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <Link
            to={ADMIN_ROUTES.cardEdit(card.id)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={`Edit ${card.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(card)}
            aria-label={`Delete ${card.name}`}
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
        title="Cards"
        description="Create, edit, publish, and manage every credit card in the catalog."
        breadcrumbs={[{ label: 'Dashboard', to: ADMIN_ROUTES.dashboard }, { label: 'Cards' }]}
        actions={
          <Button onClick={() => navigate(ADMIN_ROUTES.cardNew)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New card
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search cards…"
            startAdornment={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={network}
            onChange={(e) => {
              setNetwork(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All networks</option>
            {NETWORKS.map((n) => (
              <option key={n} value={n} className="capitalize">
                {n}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(c) => c.id}
        isLoading={isLoading}
        sort={sort}
        onSortChange={handleSort}
        onRowClick={(c) => navigate(ADMIN_ROUTES.cardEdit(c.id))}
        emptyState={<p className="text-sm text-muted-foreground">No cards match your filters.</p>}
      />

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete card"
        message={`Permanently delete “${pendingDelete?.name}”? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteCard.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
