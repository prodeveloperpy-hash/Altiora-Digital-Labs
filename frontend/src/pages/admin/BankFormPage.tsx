import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import { useBank, useCreateBank, useUpdateBank } from '@/features/admin/hooks';
import { slugify } from '@/features/admin/slug';
import type { BankWritePayload } from '@/features/admin/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';

const EMPTY: BankWritePayload = {
  slug: '',
  name: '',
  country: 'US',
  website: '',
  description: '',
  isActive: true,
};

export default function BankFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit Bank' : 'New Bank');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existing, isLoading } = useBank(isEdit ? id : undefined);
  const createBank = useCreateBank();
  const updateBank = useUpdateBank();

  const [form, setForm] = useState<BankWritePayload>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        slug: existing.slug,
        name: existing.name,
        country: existing.country,
        website: existing.website,
        description: existing.description,
        isActive: existing.isActive,
      });
      setSlugTouched(true);
    }
  }, [existing]);

  const set = <K extends keyof BankWritePayload>(key: K, value: BankWritePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const derivedSlug = useMemo(
    () => (isEdit || slugTouched ? form.slug : slugify(form.name)),
    [isEdit, slugTouched, form.slug, form.name],
  );

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!derivedSlug.trim()) next.slug = 'Slug is required.';
    if (form.website && !/^https?:\/\//.test(form.website))
      next.website = 'Website must start with http:// or https://';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, slug: derivedSlug };
    if (!validate()) return;
    try {
      if (isEdit && id) {
        await updateBank.mutateAsync({ id, payload });
        toast.success('Bank updated', `“${payload.name}” was saved.`);
      } else {
        await createBank.mutateAsync(payload);
        toast.success('Bank created', `“${payload.name}” was added.`);
      }
      navigate(ADMIN_ROUTES.banks);
    } catch (error) {
      toast.error('Save failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const saving = createBank.isPending || updateBank.isPending;

  return (
    <>
      <AdminPageHeader
        title={isEdit ? `Edit ${existing?.name ?? 'bank'}` : 'New bank'}
        breadcrumbs={[
          { label: 'Dashboard', to: ADMIN_ROUTES.dashboard },
          { label: 'Banks', to: ADMIN_ROUTES.banks },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <FormField label="Name" required error={errors.name}>
            {(field) => (
              <Input
                {...field}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. HDFC Bank"
                hasError={Boolean(errors.name)}
              />
            )}
          </FormField>

          <FormField label="Slug" required error={errors.slug} hint="Unique identifier used in URLs.">
            {(field) => (
              <Input
                {...field}
                value={derivedSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
                placeholder="hdfc-bank"
                hasError={Boolean(errors.slug)}
                disabled={isEdit}
              />
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Country">
              {(field) => (
                <Input
                  {...field}
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                  placeholder="US"
                />
              )}
            </FormField>
            <FormField label="Website" error={errors.website}>
              {(field) => (
                <Input
                  {...field}
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                  placeholder="https://…"
                  hasError={Boolean(errors.website)}
                />
              )}
            </FormField>
          </div>

          <FormField label="Description">
            {(field) => (
              <Textarea
                {...field}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Short description of the bank."
              />
            )}
          </FormField>

          <Checkbox
            id="bank-active"
            label="Active (available for cards)"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ADMIN_ROUTES.banks)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} loadingText="Saving…">
            <Save className="h-4 w-4" aria-hidden="true" />
            {isEdit ? 'Save changes' : 'Create bank'}
          </Button>
        </div>
      </form>
    </>
  );
}
