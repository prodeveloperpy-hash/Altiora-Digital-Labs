import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/features/admin/hooks';
import { slugify } from '@/features/admin/slug';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';

export default function CategoryFormPage() {
  const { id: slug } = useParams<{ id: string }>();
  const isEdit = Boolean(slug);
  useDocumentTitle(isEdit ? 'Edit Category' : 'New Category');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: categories } = useAdminCategories();
  const existing = useMemo(
    () => categories?.find((c) => c.slug === slug),
    [categories, slug],
  );
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [name, setName] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSlugValue(existing.slug);
      setDescription(existing.description);
      setSlugTouched(true);
    }
  }, [existing]);

  const derivedSlug = isEdit || slugTouched ? slugValue : slugify(name);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required.';
    if (!derivedSlug.trim()) next.slug = 'Slug is required.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      if (isEdit && slug) {
        await updateCategory.mutateAsync({ slug, payload: { name, description } });
        toast.success('Category updated', `“${name}” was saved.`);
      } else {
        await createCategory.mutateAsync({ slug: derivedSlug, name, description });
        toast.success('Category created', `“${name}” was added.`);
      }
      navigate(ADMIN_ROUTES.categories);
    } catch (error) {
      toast.error('Save failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  const saving = createCategory.isPending || updateCategory.isPending;

  return (
    <>
      <AdminPageHeader
        title={isEdit ? `Edit ${existing?.name ?? 'category'}` : 'New category'}
        breadcrumbs={[
          { label: 'Dashboard', to: ADMIN_ROUTES.dashboard },
          { label: 'Categories', to: ADMIN_ROUTES.categories },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <FormField label="Name" required error={errors.name}>
            {(field) => (
              <Input
                {...field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Travel"
                hasError={Boolean(errors.name)}
              />
            )}
          </FormField>

          <FormField
            label="Slug"
            required
            error={errors.slug}
            hint="Stable identifier — cannot be changed after creation."
          >
            {(field) => (
              <Input
                {...field}
                value={derivedSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlugValue(slugify(e.target.value));
                }}
                placeholder="travel"
                hasError={Boolean(errors.slug)}
                disabled={isEdit}
              />
            )}
          </FormField>

          <FormField label="Description">
            {(field) => (
              <Textarea
                {...field}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of cards belong to this category?"
              />
            )}
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ADMIN_ROUTES.categories)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} loadingText="Saving…">
            <Save className="h-4 w-4" aria-hidden="true" />
            {isEdit ? 'Save changes' : 'Create category'}
          </Button>
        </div>
      </form>
    </>
  );
}
