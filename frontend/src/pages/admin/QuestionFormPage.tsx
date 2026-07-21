import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import {
  useCreateQuestion,
  useQuestion,
  useUpdateQuestion,
} from '@/features/admin/hooks';
import { slugify } from '@/features/admin/slug';
import type { QuestionOption, QuestionType, QuestionWritePayload } from '@/features/admin/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TagInput } from '@/components/admin/TagInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'radio', label: 'Radio (single choice)' },
  { value: 'checkbox', label: 'Checkbox (multiple choice)' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'number', label: 'Number' },
  { value: 'slider', label: 'Slider' },
];

const CHOICE_TYPES: QuestionType[] = ['radio', 'checkbox', 'dropdown'];
const RANGE_TYPES: QuestionType[] = ['number', 'slider'];

function emptyOption(): QuestionOption {
  return {
    label: '',
    value: '',
    weight: 1,
    mappedCategories: [],
    mappedRules: [],
    mappedCardConditions: [],
  };
}

const EMPTY: QuestionWritePayload = {
  key: '',
  label: '',
  helpText: '',
  type: 'radio',
  isRequired: false,
  isActive: true,
  config: {},
  options: [],
};

export default function QuestionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit Question' : 'New Question');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existing, isLoading } = useQuestion(isEdit ? id : undefined);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const [form, setForm] = useState<QuestionWritePayload>(EMPTY);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [config, setConfig] = useState<{ min: string; max: string; step: string; unit: string }>({
    min: '',
    max: '',
    step: '',
    unit: '',
  });
  const [keyTouched, setKeyTouched] = useState(false);
  const [openOption, setOpenOption] = useState<number | null>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        key: existing.key,
        label: existing.label,
        helpText: existing.helpText,
        type: existing.type,
        isRequired: existing.isRequired,
        isActive: existing.isActive,
        config: existing.config,
        options: [],
      });
      setOptions(
        existing.options.map((o) => ({
          label: o.label,
          value: o.value,
          weight: o.weight,
          mappedCategories: o.mappedCategories,
          mappedRules: o.mappedRules,
          mappedCardConditions: o.mappedCardConditions,
        })),
      );
      const c = existing.config as Record<string, unknown>;
      setConfig({
        min: c.min != null ? String(c.min) : '',
        max: c.max != null ? String(c.max) : '',
        step: c.step != null ? String(c.step) : '',
        unit: c.unit != null ? String(c.unit) : '',
      });
      setKeyTouched(true);
    }
  }, [existing]);

  const set = <K extends keyof QuestionWritePayload>(key: K, value: QuestionWritePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const derivedKey = useMemo(
    () => (isEdit || keyTouched ? form.key : slugify(form.label).replace(/-/g, '_')),
    [isEdit, keyTouched, form.key, form.label],
  );

  const isChoice = CHOICE_TYPES.includes(form.type);
  const isRange = RANGE_TYPES.includes(form.type);

  const updateOption = (index: number, patch: Partial<QuestionOption>) =>
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));

  const buildConfig = (): Record<string, unknown> => {
    if (!isRange) return {};
    const out: Record<string, unknown> = {};
    if (config.min !== '') out.min = Number(config.min);
    if (config.max !== '') out.max = Number(config.max);
    if (config.step !== '') out.step = Number(config.step);
    if (config.unit !== '') out.unit = config.unit;
    return out;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.label.trim()) next.label = 'Question label is required.';
    if (!derivedKey.trim()) next.key = 'A machine key is required.';
    if (isChoice && options.filter((o) => o.label.trim()).length === 0)
      next.options = 'Add at least one option.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const cleanedOptions = isChoice
      ? options
          .filter((o) => o.label.trim())
          .map((o) => ({
            ...o,
            value: o.value.trim() || slugify(o.label),
            weight: Number(o.weight) || 0,
          }))
      : [];

    const payload: QuestionWritePayload = {
      ...form,
      key: derivedKey,
      config: buildConfig(),
      options: cleanedOptions,
    };

    try {
      if (isEdit && id) {
        await updateQuestion.mutateAsync({ id, payload });
        toast.success('Question updated', `“${payload.label}” was saved.`);
      } else {
        await createQuestion.mutateAsync(payload);
        toast.success('Question created', `“${payload.label}” was added.`);
      }
      navigate(ADMIN_ROUTES.questions);
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

  const saving = createQuestion.isPending || updateQuestion.isPending;

  return (
    <>
      <AdminPageHeader
        title={isEdit ? `Edit question` : 'New question'}
        breadcrumbs={[
          { label: 'Dashboard', to: ADMIN_ROUTES.dashboard },
          { label: 'Questions', to: ADMIN_ROUTES.questions },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <section className="space-y-5 rounded-xl border border-border bg-card p-6">
          <FormField label="Question label" required error={errors.label}>
            {(field) => (
              <Input
                {...field}
                value={form.label}
                onChange={(e) => set('label', e.target.value)}
                hasError={Boolean(errors.label)}
                placeholder="e.g. What is your primary goal?"
              />
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Answer key" required error={errors.key} hint="Stable key the engine reads.">
              {(field) => (
                <Input
                  {...field}
                  value={derivedKey}
                  onChange={(e) => {
                    setKeyTouched(true);
                    set('key', e.target.value.replace(/\s+/g, ''));
                  }}
                  hasError={Boolean(errors.key)}
                  placeholder="primaryGoal"
                  disabled={isEdit}
                />
              )}
            </FormField>
            <FormField label="Type">
              {(field) => (
                <Select
                  {...field}
                  value={form.type}
                  onChange={(e) => set('type', e.target.value as QuestionType)}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>

          <FormField label="Help text">
            {(field) => (
              <Textarea
                {...field}
                rows={2}
                value={form.helpText}
                onChange={(e) => set('helpText', e.target.value)}
                placeholder="Optional guidance shown under the question."
              />
            )}
          </FormField>

          <div className="flex flex-wrap gap-5">
            <Checkbox
              id="q-required"
              label="Required"
              checked={form.isRequired}
              onChange={(e) => set('isRequired', e.target.checked)}
            />
            <Checkbox
              id="q-active"
              label="Active"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
            />
          </div>
        </section>

        {isRange && (
          <section className="space-y-5 rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground">Range configuration</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <FormField label="Min">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    value={config.min}
                    onChange={(e) => setConfig((c) => ({ ...c, min: e.target.value }))}
                  />
                )}
              </FormField>
              <FormField label="Max">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    value={config.max}
                    onChange={(e) => setConfig((c) => ({ ...c, max: e.target.value }))}
                  />
                )}
              </FormField>
              <FormField label="Step">
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    value={config.step}
                    onChange={(e) => setConfig((c) => ({ ...c, step: e.target.value }))}
                  />
                )}
              </FormField>
              <FormField label="Unit">
                {(field) => (
                  <Input
                    {...field}
                    value={config.unit}
                    onChange={(e) => setConfig((c) => ({ ...c, unit: e.target.value }))}
                    placeholder="$"
                  />
                )}
              </FormField>
            </div>
          </section>
        )}

        {isChoice && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Options</h2>
                {errors.options && (
                  <p className="text-xs font-medium text-destructive">{errors.options}</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setOptions((prev) => [...prev, emptyOption()]);
                  setOpenOption(options.length);
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add option
              </Button>
            </div>

            {options.length === 0 && (
              <p className="text-sm text-muted-foreground">No options yet.</p>
            )}

            <div className="space-y-3">
              {options.map((option, index) => {
                const open = openOption === index;
                return (
                  <div key={index} className="rounded-lg border border-border">
                    <div className="flex items-center gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => setOpenOption(open ? null : index)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={open ? 'Collapse' : 'Expand'}
                      >
                        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(index, { label: e.target.value })}
                        placeholder="Option label"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setOptions((prev) => prev.filter((_, i) => i !== index))}
                        aria-label="Remove option"
                        className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {open && (
                      <div className="space-y-4 border-t border-border p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField label="Value" hint="Stored answer value.">
                            {(field) => (
                              <Input
                                {...field}
                                value={option.value}
                                onChange={(e) => updateOption(index, { value: e.target.value })}
                                placeholder={slugify(option.label) || 'value'}
                              />
                            )}
                          </FormField>
                          <FormField label="Weight" hint="Scoring weight for this option.">
                            {(field) => (
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                value={option.weight}
                                onChange={(e) =>
                                  updateOption(index, { weight: Number(e.target.value) })
                                }
                              />
                            )}
                          </FormField>
                        </div>
                        <FormField label="Mapped categories" hint="Category slugs this option targets.">
                          {() => (
                            <TagInput
                              value={option.mappedCategories}
                              onChange={(v) => updateOption(index, { mappedCategories: v })}
                              placeholder="e.g. travel"
                            />
                          )}
                        </FormField>
                        <FormField label="Mapped rules" hint="Recommendation-rule codes reinforced.">
                          {() => (
                            <TagInput
                              value={option.mappedRules}
                              onChange={(v) => updateOption(index, { mappedRules: v })}
                              placeholder="e.g. traveler_no_fx"
                            />
                          )}
                        </FormField>
                        <CardConditionsEditor
                          conditions={option.mappedCardConditions}
                          onChange={(v) => updateOption(index, { mappedCardConditions: v })}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(ADMIN_ROUTES.questions)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} loadingText="Saving…">
            <Save className="h-4 w-4" aria-hidden="true" />
            {isEdit ? 'Save changes' : 'Create question'}
          </Button>
        </div>
      </form>
    </>
  );
}

const CONDITION_OPERATORS = ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'in'];

function CardConditionsEditor({
  conditions,
  onChange,
}: {
  conditions: { field: string; operator: string; value: string | number }[];
  onChange: (next: { field: string; operator: string; value: string | number }[]) => void;
}) {
  const update = (index: number, patch: Partial<{ field: string; operator: string; value: string }>) =>
    onChange(conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Mapped card conditions</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...conditions, { field: '', operator: 'eq', value: '' }])}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>
      {conditions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Optional: constrain which cards this option favors.
        </p>
      )}
      {conditions.map((cond, index) => (
        <div key={index} className="grid grid-cols-12 items-center gap-2">
          <Input
            className="col-span-5"
            value={cond.field}
            onChange={(e) => update(index, { field: e.target.value })}
            placeholder="Card field (e.g. annualFee)"
          />
          <Select
            className="col-span-3"
            value={cond.operator}
            onChange={(e) => update(index, { operator: e.target.value })}
          >
            {CONDITION_OPERATORS.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </Select>
          <Input
            className="col-span-3"
            value={String(cond.value)}
            onChange={(e) => update(index, { value: e.target.value })}
            placeholder="Value"
          />
          <button
            type="button"
            onClick={() => onChange(conditions.filter((_, i) => i !== index))}
            aria-label="Remove condition"
            className="col-span-1 flex justify-center rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
