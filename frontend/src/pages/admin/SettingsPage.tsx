import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import { useSettings, useUpdateSettings } from '@/features/admin/hooks';
import type { Setting } from '@/features/admin/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { AdminAccounts } from '@/components/admin/AdminAccounts';
import { AdminProfileSecurity } from '@/components/admin/AdminProfileSecurity';

/** Serialize a stored value into an editable string for the form. */
function toDraft(setting: Setting): string {
  if (setting.value == null) return '';
  if (setting.valueType === 'json') return JSON.stringify(setting.value, null, 2);
  return String(setting.value);
}

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const toast = useToast();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const next: Record<string, string> = {};
      settings.forEach((s) => {
        next[s.key] = toDraft(s);
      });
      setDrafts(next);
    }
  }, [settings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    const values: Record<string, unknown> = {};
    const nextErrors: Record<string, string> = {};

    for (const setting of settings) {
      const raw = drafts[setting.key] ?? '';
      if (setting.valueType === 'number') {
        const num = Number(raw);
        if (raw === '' || Number.isNaN(num)) {
          nextErrors[setting.key] = 'Enter a valid number.';
          continue;
        }
        values[setting.key] = num;
      } else if (setting.valueType === 'json') {
        try {
          values[setting.key] = raw.trim() ? JSON.parse(raw) : null;
        } catch {
          nextErrors[setting.key] = 'Invalid JSON.';
        }
      } else {
        values[setting.key] = raw;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Check the form', 'Some settings have invalid values.');
      return;
    }

    try {
      await updateSettings.mutateAsync(values);
      toast.success('Settings saved', 'Your changes have been applied.');
    } catch (error) {
      toast.error('Save failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Global configuration for the application and recommendation engine."
        breadcrumbs={[{ label: 'Dashboard', to: ADMIN_ROUTES.dashboard }, { label: 'Settings' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          {settings?.map((setting) => (
            <FormField
              key={setting.key}
              label={setting.label || setting.key}
              hint={setting.description}
              error={errors[setting.key]}
            >
              {(field) => renderControl(setting, drafts[setting.key] ?? '', (v) =>
                setDrafts((prev) => ({ ...prev, [setting.key]: v })), field, Boolean(errors[setting.key]),
              )}
            </FormField>
          ))}
          {(!settings || settings.length === 0) && (
            <p className="text-sm text-muted-foreground">No settings available.</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" isLoading={updateSettings.isPending} loadingText="Saving…">
            <Save className="h-4 w-4" aria-hidden="true" />
            Save settings
          </Button>
        </div>
      </form>

      <AdminProfileSecurity />
      <AdminAccounts />
    </>
  );
}

type FieldProps = {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
};

function renderControl(
  setting: Setting,
  value: string,
  onChange: (value: string) => void,
  field: FieldProps,
  hasError: boolean,
) {
  if (setting.key === 'theme' || setting.valueType === 'select') {
    return (
      <Select {...field} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </Select>
    );
  }
  if (setting.valueType === 'json') {
    return (
      <Textarea
        {...field}
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hasError={hasError}
        className="font-mono text-xs"
      />
    );
  }
  if (setting.valueType === 'number') {
    return (
      <Input
        {...field}
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        hasError={hasError}
      />
    );
  }
  return (
    <Input {...field} value={value} onChange={(e) => onChange(e.target.value)} hasError={hasError} />
  );
}
