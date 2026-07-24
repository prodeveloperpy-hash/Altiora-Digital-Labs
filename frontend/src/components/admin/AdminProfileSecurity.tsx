import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { isApiError } from '@/lib/apiError';
import { useToast } from '@/context/toast/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

export function AdminProfileSecurity() {
  const { user, updateProfile, logout } = useAdminAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailPassword, setEmailPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!emailPassword) {
      setEmailErrors({ currentPassword: 'Enter your current password.' });
      return;
    }
    setSavingEmail(true);
    setEmailErrors({});
    try {
      await updateProfile({ email: email.trim(), currentPassword: emailPassword });
      setEmailPassword('');
      toast.success('Email updated', 'Your administrator email has been changed.');
    } catch (error) {
      if (isApiError(error)) setEmailErrors(error.fieldErrors ?? {});
      toast.error('Update failed', isApiError(error) ? error.message : 'Please try again.');
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Enter your current password.';
    if (newPassword.length < 8) errors.newPassword = 'Use at least 8 characters.';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;
    setSavingPassword(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      toast.success('Password updated', 'Sign in again with your new password.');
      await logout();
      navigate(ADMIN_ROUTES.login, { replace: true });
    } catch (error) {
      if (isApiError(error)) setPasswordErrors(error.fieldErrors ?? {});
      toast.error('Update failed', isApiError(error) ? error.message : 'Please try again.');
      setSavingPassword(false);
    }
  };

  return (
    <section className="mt-10 max-w-4xl border-t border-border pt-8">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update your own sign-in email or password.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveEmail} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="flex items-center gap-2 font-semibold"><Mail className="h-5 w-5 text-primary" /> Email address</h3>
          <FormField label="Email" error={emailErrors.email} required>
            {(field) => <Input {...field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} hasError={Boolean(emailErrors.email)} />}
          </FormField>
          <FormField label="Current password" error={emailErrors.currentPassword} required>
            {(field) => <Input {...field} type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} hasError={Boolean(emailErrors.currentPassword)} />}
          </FormField>
          <Button type="submit" variant="outline" fullWidth isLoading={savingEmail}>Update email</Button>
        </form>

        <form onSubmit={savePassword} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="flex items-center gap-2 font-semibold"><LockKeyhole className="h-5 w-5 text-primary" /> Change password</h3>
          <FormField label="Current password" error={passwordErrors.currentPassword} required>
            {(field) => <Input {...field} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} hasError={Boolean(passwordErrors.currentPassword)} />}
          </FormField>
          <FormField label="New password" error={passwordErrors.newPassword} hint="At least 8 characters." required>
            {(field) => <Input {...field} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hasError={Boolean(passwordErrors.newPassword)} />}
          </FormField>
          <FormField label="Confirm password" error={passwordErrors.confirmPassword} required>
            {(field) => <Input {...field} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} hasError={Boolean(passwordErrors.confirmPassword)} />}
          </FormField>
          <Button type="submit" fullWidth isLoading={savingPassword}>Update password</Button>
        </form>
      </div>
    </section>
  );
}
