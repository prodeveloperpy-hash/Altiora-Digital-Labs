import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, User } from 'lucide-react';
import { ADMIN_ROUTES, APP_NAME } from '@/config/constants';
import { useAdminAuth } from '@/features/admin/auth/useAdminAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { isApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Checkbox } from '@/components/ui/Checkbox';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  useDocumentTitle('Admin Login');
  const { isAuthenticated, isInitializing, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? ADMIN_ROUTES.dashboard;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        isApiError(err) ? err.message : 'Unable to sign in. Please check your credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            {APP_NAME.charAt(0)}
          </span>
          <h1 className="text-2xl font-bold text-foreground">{APP_NAME} Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage the platform.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          <FormField label="Username or email">
            {(field) => (
              <Input
                {...field}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                startAdornment={<User className="h-4 w-4" />}
                placeholder="admin"
              />
            )}
          </FormField>

          <FormField label="Password">
            {(field) => (
              <Input
                {...field}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                startAdornment={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
              />
            )}
          </FormField>

          <Checkbox
            id="remember"
            label="Remember me on this device"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />

          <Button type="submit" fullWidth isLoading={submitting} loadingText="Signing in…">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
