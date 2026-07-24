import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Trash2, Users } from 'lucide-react';
import { authApi } from '@/features/admin/api/adminApi';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import type { AdminUser } from '@/features/admin/types';
import { isApiError } from '@/lib/apiError';
import { useToast } from '@/context/toast/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from './ConfirmDialog';

const ADMINS_KEY = ['admin', 'accounts'] as const;

export function AdminAccounts() {
  const { user, hasRole } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const canManage = hasRole('super_admin');
  const admins = useQuery({
    queryKey: ADMINS_KEY,
    queryFn: authApi.listAdmins,
    enabled: canManage,
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const refresh = () => queryClient.invalidateQueries({ queryKey: ADMINS_KEY });
  const createAdmin = useMutation({
    mutationFn: () => authApi.createAdmin({ email: email.trim(), password }),
    onSuccess: () => {
      setEmail('');
      setPassword('');
      setErrors({});
      refresh();
      toast.success('Administrator added', 'The new administrator can now sign in.');
    },
    onError: (error) => {
      if (isApiError(error)) setErrors(error.fieldErrors ?? {});
      toast.error('Unable to add admin', isApiError(error) ? error.message : 'Please try again.');
    },
  });
  const resetMutation = useMutation({
    mutationFn: () => authApi.updateAdminPassword(resetTarget!.id, resetPassword),
    onSuccess: () => {
      setResetTarget(null);
      setResetPassword('');
      toast.success('Password updated', 'Existing sessions for this administrator were revoked.');
    },
    onError: (error) =>
      toast.error('Unable to update password', isApiError(error) ? error.message : 'Please try again.'),
  });
  const deleteMutation = useMutation({
    mutationFn: () => authApi.deleteAdmin(deleteTarget!.id),
    onSuccess: () => {
      setDeleteTarget(null);
      refresh();
      toast.success('Administrator deleted', 'The account has been removed.');
    },
    onError: (error) =>
      toast.error('Unable to delete admin', isApiError(error) ? error.message : 'Please try again.'),
  });

  const submitCreate = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = 'Enter an email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    if (!Object.keys(next).length) createAdmin.mutate();
  };

  if (!canManage) return null;
  const rows = admins.data ?? [];

  return (
    <section className="mt-10 max-w-4xl border-t border-border pt-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold">Administrators</h2>
          <p className="text-sm text-muted-foreground">Add, secure, and remove administrator accounts.</p>
        </div>
      </div>

      <form onSubmit={submitCreate} className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:grid-cols-2">
        <FormField label="New admin email" error={errors.email} required>
          {(field) => <Input {...field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} hasError={Boolean(errors.email)} />}
        </FormField>
        <FormField label="Temporary password" hint="At least 8 characters." error={errors.password} required>
          {(field) => <Input {...field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} hasError={Boolean(errors.password)} />}
        </FormField>
        <div className="sm:col-span-2 sm:justify-self-end">
          <Button type="submit" isLoading={createAdmin.isPending} loadingText="Adding…">
            <Plus className="h-4 w-4" /> Add administrator
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {rows.map((admin) => (
          <div key={admin.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between [&:not(:last-child)]:border-b">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium">{admin.email}</span>
                <Badge variant={admin.role === 'super_admin' ? 'primary' : 'secondary'}>{admin.role.replace('_', ' ')}</Badge>
                {admin.id === user?.id && <Badge variant="default">You</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">@{admin.username}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={admin.id === user?.id}
                title={admin.id === user?.id ? 'Use the Your account form to change your password.' : undefined}
                onClick={() => setResetTarget(admin)}
              >
                <KeyRound className="h-4 w-4" /> Password
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={admin.id === user?.id || rows.length <= 1} onClick={() => setDeleteTarget(admin)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {!admins.isLoading && rows.length === 0 && <p className="p-6 text-sm text-muted-foreground">No administrators found.</p>}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete administrator"
        message={`Delete “${deleteTarget?.email}”? The last administrator cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteTarget(null)}
      />

      {resetTarget && (
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold">Update password for {resetTarget.email}</h3>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="New password (8+ characters)" />
            <Button disabled={resetPassword.length < 8} isLoading={resetMutation.isPending} onClick={() => resetMutation.mutate()}>Update password</Button>
            <Button variant="ghost" onClick={() => { setResetTarget(null); setResetPassword(''); }}>Cancel</Button>
          </div>
        </div>
      )}
    </section>
  );
}
