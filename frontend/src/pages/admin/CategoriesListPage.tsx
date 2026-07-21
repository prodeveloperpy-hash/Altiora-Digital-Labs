import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import { useAdminCategories, useDeleteCategory } from '@/features/admin/hooks';
import type { AdminCategory } from '@/features/admin/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function CategoriesListPage() {
  useDocumentTitle('Categories');
  const navigate = useNavigate();
  const toast = useToast();
  const { data: categories = [], isLoading } = useAdminCategories();
  const deleteCategory = useDeleteCategory();
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory.mutateAsync(pendingDelete.slug);
      toast.success('Category deleted', `“${pendingDelete.name}” was removed.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error('Delete failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  const columns: Column<AdminCategory>[] = [
    {
      key: 'name',
      header: 'Category',
      render: (cat) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{cat.name}</span>
          <span className="text-xs text-muted-foreground">{cat.slug}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (cat) => (
        <span className="line-clamp-1 text-muted-foreground">{cat.description || '—'}</span>
      ),
    },
    {
      key: 'cardCount',
      header: 'Cards',
      align: 'center',
      render: (cat) => <Badge variant="secondary">{cat.cardCount}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (cat) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={ADMIN_ROUTES.categoryEdit(cat.slug)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={`Edit ${cat.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(cat)}
            aria-label={`Delete ${cat.name}`}
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
        title="Categories"
        description="Card categories power browsing, filters, and recommendation targeting."
        breadcrumbs={[{ label: 'Dashboard', to: ADMIN_ROUTES.dashboard }, { label: 'Categories' }]}
        actions={
          <Button onClick={() => navigate(ADMIN_ROUTES.categoryNew)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={categories}
        getRowId={(c) => c.slug}
        isLoading={isLoading}
        onRowClick={(c) => navigate(ADMIN_ROUTES.categoryEdit(c.slug))}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete category"
        message={`Delete “${pendingDelete?.name}”? It will be removed from any cards that use it.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteCategory.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
