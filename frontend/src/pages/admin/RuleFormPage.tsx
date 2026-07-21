import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import {
  useCreateRule,
  useRule,
  useRuleCatalog,
  useUpdateRule,
} from '@/features/admin/hooks';
import type { RuleOutcome, RuleWritePayload } from '@/features/admin/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';

const EMPTY: RuleWritePayload = {
  code: '',
  description: '',
  operator: '',
  answerField: null,
  cardField: null,
  targetNumber: null,
  targetValue: null,
  points: 0,
  weightKey: null,
  benefitCode: null,
  reasonLabel: '',
  reasonDetail: '',
  outcome: 'pro',
  isActive: true,
  priority: 100,
};

export default function RuleFormPage() {
  const { id } = useParams<{ id: string }>();
  const ruleId = id ? Number(id) : undefined;
  const isEdit = typeof ruleId === 'number' && !Number.isNaN(ruleId);
  useDocumentTitle(isEdit ? 'Edit Rule' : 'New Rule');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existing, isLoading } = useRule(isEdit ? ruleId : undefined);
  const { data: catalog } = useRuleCatalog();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();

  const [form, setForm] = useState<RuleWritePayload>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        code: existing.code,
        description: existing.description,
        operator: existing.operator,
        answerField: existing.answerField ?? null,
        cardField: existing.cardField ?? null,
        targetNumber: existing.targetNumber ?? null,
        targetValue: existing.targetValue ?? null,
        points: existing.points,
        weightKey: existing.weightKey ?? null,
        benefitCode: existing.benefitCode ?? null,
        reasonLabel: existing.reasonLabel,
        reasonDetail: existing.reasonDetail,
        outcome: existing.outcome,
        isActive: existing.isActive,
        priority: existing.priority,
      });
    }
  }, [existing]);

  const set = <K extends keyof RuleWritePayload>(key: K, value: RuleWritePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = 'A unique code is required.';
    if (!form.operator) next.operator = 'Select an operator.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      if (isEdit && ruleId) {
        await updateRule.mutateAsync({ id: ruleId, payload: form });
        toast.success('Rule updated', `“${form.code}” was saved.`);
      } else {
        await createRule.mutateAsync(form);
        toast.success('Rule created', `“${form.code}” was added.`);
      }
      navigate(ADMIN_ROUTES.rules);
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

  const saving = createRule.isPending || updateRule.isPending;

  return (
    <>
      <AdminPageHeader
        title={isEdit ? `Edit ${existing?.code ?? 'rule'}` : 'New rule'}
        description="Rules are pure data the engine evaluates. Operators define the comparison; weights and points define impact."
        breadcrumbs={[
          { label: 'Dashboard', to: ADMIN_ROUTES.dashboard },
          { label: 'Recommendation Rules', to: ADMIN_ROUTES.rules },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <section className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Code" required error={errors.code} hint="Unique identifier for the rule.">
              {(field) => (
                <Input
                  {...field}
                  value={form.code}
                  onChange={(e) => set('code', e.target.value)}
                  hasError={Boolean(errors.code)}
                  placeholder="e.g. traveler_no_fx"
                  disabled={isEdit}
                />
              )}
            </FormField>
            <FormField label="Operator" required error={errors.operator}>
              {(field) => (
                <Select
                  {...field}
                  value={form.operator}
                  onChange={(e) => set('operator', e.target.value)}
                  hasError={Boolean(errors.operator)}
                >
                  <option value="">— Select operator —</option>
                  {catalog?.scoring.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>

          <FormField label="Description">
            {(field) => (
              <Textarea
                {...field}
                rows={2}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What does this rule express?"
              />
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Answer field" hint="Questionnaire answer key this rule reads.">
              {(field) => (
                <Input
                  {...field}
                  value={form.answerField ?? ''}
                  onChange={(e) => set('answerField', e.target.value || null)}
                  placeholder="e.g. primaryGoal"
                />
              )}
            </FormField>
            <FormField label="Card field" hint="Card attribute this rule compares against.">
              {(field) => (
                <Select
                  {...field}
                  value={form.cardField ?? ''}
                  onChange={(e) => set('cardField', e.target.value || null)}
                >
                  <option value="">— None —</option>
                  {catalog?.cardFields.map((cf) => (
                    <option key={cf} value={cf}>
                      {cf}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Target number" hint="Numeric threshold, if the operator needs one.">
              {(field) => (
                <Input
                  {...field}
                  type="number"
                  step="any"
                  value={form.targetNumber ?? ''}
                  onChange={(e) =>
                    set('targetNumber', e.target.value === '' ? null : Number(e.target.value))
                  }
                />
              )}
            </FormField>
            <FormField label="Target value" hint="String/token target, if applicable.">
              {(field) => (
                <Input
                  {...field}
                  value={form.targetValue ?? ''}
                  onChange={(e) => set('targetValue', e.target.value || null)}
                />
              )}
            </FormField>
          </div>
        </section>

        <section className="space-y-5 rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">Scoring & explanation</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField label="Points" hint="Base score (may be negative).">
              {(field) => (
                <Input
                  {...field}
                  type="number"
                  step="any"
                  value={form.points}
                  onChange={(e) => set('points', Number(e.target.value) || 0)}
                />
              )}
            </FormField>
            <FormField label="Weight key" hint="Named multiplier applied to points.">
              {(field) => (
                <Select
                  {...field}
                  value={form.weightKey ?? ''}
                  onChange={(e) => set('weightKey', e.target.value || null)}
                >
                  <option value="">— None (×1) —</option>
                  {catalog?.weightKeys.map((wk) => (
                    <option key={wk} value={wk}>
                      {wk}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Priority" hint="Lower runs first.">
              {(field) => (
                <Input
                  {...field}
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(e) => set('priority', Number(e.target.value) || 0)}
                />
              )}
            </FormField>
            <FormField label="Outcome">
              {(field) => (
                <Select
                  {...field}
                  value={form.outcome}
                  onChange={(e) => set('outcome', e.target.value as RuleOutcome)}
                >
                  <option value="pro">Pro</option>
                  <option value="con">Con</option>
                  <option value="neutral">Neutral</option>
                </Select>
              )}
            </FormField>
            <FormField label="Benefit code" hint="Optional matched benefit.">
              {(field) => (
                <Input
                  {...field}
                  value={form.benefitCode ?? ''}
                  onChange={(e) => set('benefitCode', e.target.value || null)}
                  placeholder="e.g. no-fx-fee"
                />
              )}
            </FormField>
          </div>

          <FormField label="Reason label" hint="Short headline shown to the user when this rule matches.">
            {(field) => (
              <Input
                {...field}
                value={form.reasonLabel}
                onChange={(e) => set('reasonLabel', e.target.value)}
                placeholder="e.g. Great for international travel"
              />
            )}
          </FormField>
          <FormField label="Reason detail">
            {(field) => (
              <Textarea
                {...field}
                rows={2}
                value={form.reasonDetail}
                onChange={(e) => set('reasonDetail', e.target.value)}
                placeholder="Full explanation shown alongside the recommendation."
              />
            )}
          </FormField>

          <Checkbox
            id="rule-active"
            label="Active (evaluated by the engine)"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
          />
        </section>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ADMIN_ROUTES.rules)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} loadingText="Saving…">
            <Save className="h-4 w-4" aria-hidden="true" />
            {isEdit ? 'Save changes' : 'Create rule'}
          </Button>
        </div>
      </form>
    </>
  );
}
