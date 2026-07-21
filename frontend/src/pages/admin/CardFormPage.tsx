import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, Trash2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import {
  useAdminCard,
  useAdminCategories,
  useBanks,
  useCreateCard,
  useUpdateCard,
} from '@/features/admin/hooks';
import { slugify } from '@/features/admin/slug';
import type { CardWritePayload } from '@/features/admin/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TagInput } from '@/components/admin/TagInput';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';

const NETWORKS = ['visa', 'mastercard', 'amex', 'discover'];
const CREDIT_TIERS = ['excellent', 'good', 'fair', 'poor', 'building'];
const REWARD_UNITS = ['percent', 'points', 'miles'];

type RewardRateDraft = { category: string; rate: number; unit: string; cap: string };

const EMPTY: CardWritePayload = {
  slug: '',
  name: '',
  issuer: '',
  network: 'visa',
  bankId: null,
  categories: [],
  imageUrl: '',
  summary: '',
  description: '',
  annualFee: 0,
  aprMin: 0,
  aprMax: 0,
  introApr: null,
  introAprMonths: null,
  foreignTransactionFee: 0,
  recommendedCreditScore: 'good',
  rewardsSummary: '',
  rewardRates: [],
  signupBonus: null,
  signupBonusValue: null,
  rewardsCurrency: null,
  benefits: [],
  pros: [],
  cons: [],
  rating: 0,
  reviewCount: 0,
  applyUrl: '',
  isFeatured: false,
  isActive: true,
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function CardFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit Card' : 'New Card');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existing, isLoading } = useAdminCard(isEdit ? id : undefined);
  const { data: banks = [] } = useBanks();
  const { data: categories = [] } = useAdminCategories();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();

  const [form, setForm] = useState<CardWritePayload>(EMPTY);
  const [rates, setRates] = useState<RewardRateDraft[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        slug: existing.slug,
        name: existing.name,
        issuer: existing.issuer,
        network: existing.network,
        bankId: existing.bankId ?? null,
        categories: existing.categories,
        imageUrl: existing.imageUrl,
        summary: existing.summary,
        description: existing.description,
        annualFee: existing.annualFee,
        aprMin: existing.aprMin,
        aprMax: existing.aprMax,
        introApr: existing.introApr ?? null,
        introAprMonths: existing.introAprMonths ?? null,
        foreignTransactionFee: existing.foreignTransactionFee,
        recommendedCreditScore: existing.recommendedCreditScore,
        rewardsSummary: existing.rewardsSummary,
        rewardRates: [],
        signupBonus: existing.signupBonus ?? null,
        signupBonusValue: existing.signupBonusValue ?? null,
        rewardsCurrency: existing.rewardsCurrency ?? null,
        benefits: existing.benefits,
        pros: existing.pros,
        cons: existing.cons,
        rating: existing.rating,
        reviewCount: existing.reviewCount,
        applyUrl: existing.applyUrl,
        isFeatured: existing.isFeatured,
        isActive: existing.isActive,
      });
      setRates(
        existing.rewardRates.map((r) => ({
          category: r.category,
          rate: r.rate,
          unit: r.unit,
          cap: r.cap ?? '',
        })),
      );
      setSlugTouched(true);
    }
  }, [existing]);

  const set = <K extends keyof CardWritePayload>(key: K, value: CardWritePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const derivedSlug = useMemo(
    () => (isEdit || slugTouched ? form.slug : slugify(form.name)),
    [isEdit, slugTouched, form.slug, form.name],
  );

  const toggleCategory = (slug: string) => {
    set(
      'categories',
      form.categories.includes(slug)
        ? form.categories.filter((c) => c !== slug)
        : [...form.categories, slug],
    );
  };

  const updateRate = (index: number, patch: Partial<RewardRateDraft>) =>
    setRates((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!derivedSlug.trim()) next.slug = 'Slug is required.';
    if (!form.issuer.trim()) next.issuer = 'Issuer is required.';
    if (form.aprMax < form.aprMin) next.aprMax = 'Max APR cannot be below min APR.';
    if (form.rating < 0 || form.rating > 5) next.rating = 'Rating must be between 0 and 5.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error('Check the form', 'Some fields need your attention.');
      return;
    }
    const bank = banks.find((b) => b.id === form.bankId);
    const payload: CardWritePayload = {
      ...form,
      slug: derivedSlug,
      // Keep issuer in sync with the selected bank when one is chosen.
      issuer: bank ? bank.name : form.issuer,
      rewardRates: rates
        .filter((r) => r.category.trim())
        .map((r) => ({
          category: r.category.trim(),
          rate: Number(r.rate) || 0,
          unit: r.unit,
          cap: r.cap.trim() || null,
        })),
    };
    try {
      if (isEdit && id) {
        await updateCard.mutateAsync({ id, payload });
        toast.success('Card updated', `“${payload.name}” was saved.`);
      } else {
        await createCard.mutateAsync(payload);
        toast.success('Card created', `“${payload.name}” was added.`);
      }
      navigate(ADMIN_ROUTES.cards);
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

  const saving = createCard.isPending || updateCard.isPending;
  const numeric = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <>
      <AdminPageHeader
        title={isEdit ? `Edit ${existing?.name ?? 'card'}` : 'New card'}
        breadcrumbs={[
          { label: 'Dashboard', to: ADMIN_ROUTES.dashboard },
          { label: 'Cards', to: ADMIN_ROUTES.cards },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Basics">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Card name" required error={errors.name}>
                {(field) => (
                  <Input
                    {...field}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    hasError={Boolean(errors.name)}
                    placeholder="e.g. Horizon Travel Elite"
                  />
                )}
              </FormField>
              <FormField label="Slug" required error={errors.slug}>
                {(field) => (
                  <Input
                    {...field}
                    value={derivedSlug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set('slug', slugify(e.target.value));
                    }}
                    hasError={Boolean(errors.slug)}
                    disabled={isEdit}
                  />
                )}
              </FormField>
              <FormField label="Bank" hint="Selecting a bank sets the issuer name.">
                {(field) => (
                  <Select
                    {...field}
                    value={form.bankId ?? ''}
                    onChange={(e) => set('bankId', e.target.value || null)}
                  >
                    <option value="">— None —</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label="Issuer" required error={errors.issuer}>
                {(field) => (
                  <Input
                    {...field}
                    value={form.issuer}
                    onChange={(e) => set('issuer', e.target.value)}
                    hasError={Boolean(errors.issuer)}
                    placeholder="Issuer name"
                  />
                )}
              </FormField>
              <FormField label="Card type (network)">
                {(field) => (
                  <Select
                    {...field}
                    value={form.network}
                    onChange={(e) => set('network', e.target.value)}
                    className="capitalize"
                  >
                    {NETWORKS.map((n) => (
                      <option key={n} value={n} className="capitalize">
                        {n}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label="Recommended credit">
                {(field) => (
                  <Select
                    {...field}
                    value={form.recommendedCreditScore}
                    onChange={(e) => set('recommendedCreditScore', e.target.value)}
                    className="capitalize"
                  >
                    {CREDIT_TIERS.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>

            <FormField label="Card image">
              {() => <ImageUploadField value={form.imageUrl} onChange={(url) => set('imageUrl', url)} />}
            </FormField>

            <FormField label="Summary" hint="Short marketing line shown in listings.">
              {(field) => (
                <Input
                  {...field}
                  value={form.summary}
                  onChange={(e) => set('summary', e.target.value)}
                  placeholder="One-sentence hook"
                />
              )}
            </FormField>
            <FormField label="Description">
              {(field) => (
                <Textarea
                  {...field}
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Full description shown on the card details page."
                />
              )}
            </FormField>
          </Section>

          <Section title="Fees & terms">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <FormField label="Annual fee ($)">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    value={form.annualFee}
                    onChange={(e) => set('annualFee', numeric(e.target.value))}
                  />
                )}
              </FormField>
              <FormField label="Foreign txn fee" hint="e.g. 0.03 for 3%">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.foreignTransactionFee}
                    onChange={(e) => set('foreignTransactionFee', numeric(e.target.value))}
                  />
                )}
              </FormField>
              <FormField label="Apply URL">
                {(field) => (
                  <Input
                    {...field}
                    value={form.applyUrl}
                    onChange={(e) => set('applyUrl', e.target.value)}
                    placeholder="https://…"
                  />
                )}
              </FormField>
              <FormField label="Min APR (%)">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.aprMin}
                    onChange={(e) => set('aprMin', numeric(e.target.value))}
                  />
                )}
              </FormField>
              <FormField label="Max APR (%)" error={errors.aprMax}>
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.aprMax}
                    onChange={(e) => set('aprMax', numeric(e.target.value))}
                    hasError={Boolean(errors.aprMax)}
                  />
                )}
              </FormField>
              <FormField label="Intro APR months">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    value={form.introAprMonths ?? ''}
                    onChange={(e) =>
                      set('introAprMonths', e.target.value === '' ? null : Number(e.target.value))
                    }
                  />
                )}
              </FormField>
            </div>
            <FormField label="Intro APR offer">
              {(field) => (
                <Input
                  {...field}
                  value={form.introApr ?? ''}
                  onChange={(e) => set('introApr', e.target.value || null)}
                  placeholder="e.g. 0% intro APR on balance transfers for 21 months"
                />
              )}
            </FormField>
          </Section>

          <Section title="Rewards" description="Earn rates by category and a summary line.">
            <FormField label="Rewards summary">
              {(field) => (
                <Input
                  {...field}
                  value={form.rewardsSummary}
                  onChange={(e) => set('rewardsSummary', e.target.value)}
                  placeholder="e.g. 3x miles on travel & dining"
                />
              )}
            </FormField>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Reward rates</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRates((prev) => [...prev, { category: '', rate: 1, unit: 'percent', cap: '' }])}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add rate
                </Button>
              </div>
              {rates.length === 0 && (
                <p className="text-sm text-muted-foreground">No reward rates yet.</p>
              )}
              {rates.map((rate, index) => (
                <div key={index} className="grid grid-cols-12 items-center gap-2">
                  <Input
                    className="col-span-5"
                    value={rate.category}
                    onChange={(e) => updateRate(index, { category: e.target.value })}
                    placeholder="Category (e.g. dining)"
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    step="0.1"
                    min={0}
                    value={rate.rate}
                    onChange={(e) => updateRate(index, { rate: Number(e.target.value) })}
                  />
                  <Select
                    className="col-span-2"
                    value={rate.unit}
                    onChange={(e) => updateRate(index, { unit: e.target.value })}
                  >
                    {REWARD_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                  <Input
                    className="col-span-2"
                    value={rate.cap}
                    onChange={(e) => updateRate(index, { cap: e.target.value })}
                    placeholder="Cap"
                  />
                  <button
                    type="button"
                    onClick={() => setRates((prev) => prev.filter((_, i) => i !== index))}
                    aria-label="Remove rate"
                    className="col-span-1 flex justify-center rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <FormField label="Welcome bonus">
                {(field) => (
                  <Input
                    {...field}
                    value={form.signupBonus ?? ''}
                    onChange={(e) => set('signupBonus', e.target.value || null)}
                    placeholder="e.g. 60,000 miles"
                  />
                )}
              </FormField>
              <FormField label="Bonus value ($)">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    value={form.signupBonusValue ?? ''}
                    onChange={(e) =>
                      set('signupBonusValue', e.target.value === '' ? null : Number(e.target.value))
                    }
                  />
                )}
              </FormField>
              <FormField label="Rewards currency">
                {(field) => (
                  <Input
                    {...field}
                    value={form.rewardsCurrency ?? ''}
                    onChange={(e) => set('rewardsCurrency', e.target.value || null)}
                    placeholder="e.g. miles, points, USD"
                  />
                )}
              </FormField>
            </div>
          </Section>

          <Section
            title="Benefits, pros & cons"
            description="Benefits cover perks like lounge access, insurance, cashback, dining, fuel, and shopping."
          >
            <FormField label="Benefits">
              {() => <TagInput value={form.benefits} onChange={(v) => set('benefits', v)} placeholder="Add a benefit…" />}
            </FormField>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Pros">
                {() => <TagInput value={form.pros} onChange={(v) => set('pros', v)} placeholder="Add a pro…" />}
              </FormField>
              <FormField label="Cons">
                {() => <TagInput value={form.cons} onChange={(v) => set('cons', v)} placeholder="Add a con…" />}
              </FormField>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Section title="Publishing">
            <div className="space-y-3">
              <Checkbox
                id="card-active"
                label="Published (visible on the site)"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
              />
              <Checkbox
                id="card-featured"
                label="Featured on the home page"
                checked={form.isFeatured}
                onChange={(e) => set('isFeatured', e.target.checked)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Rating (0–5)" error={errors.rating}>
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    value={form.rating}
                    onChange={(e) => set('rating', numeric(e.target.value))}
                    hasError={Boolean(errors.rating)}
                  />
                )}
              </FormField>
              <FormField label="Review count">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    value={form.reviewCount}
                    onChange={(e) => set('reviewCount', numeric(e.target.value))}
                  />
                )}
              </FormField>
            </div>
          </Section>

          <Section title="Categories" description="Used for browsing, filters, and goal matching.">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = form.categories.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-secondary',
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">No categories defined yet.</p>
              )}
            </div>
          </Section>

          <div className="flex flex-col gap-3">
            <Button type="submit" fullWidth isLoading={saving} loadingText="Saving…">
              <Save className="h-4 w-4" aria-hidden="true" />
              {isEdit ? 'Save changes' : 'Create card'}
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={() => navigate(ADMIN_ROUTES.cards)}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
