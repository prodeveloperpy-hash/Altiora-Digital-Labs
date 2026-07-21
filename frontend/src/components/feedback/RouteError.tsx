import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/constants';

/** errorElement for the router: renders thrown route/render errors gracefully. */
export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while loading this page.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message =
      error.status === 404
        ? 'We could not find the page you were looking for.'
        : (typeof error.data === 'string' && error.data) || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10 text-center shadow-card">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertOctagon className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={() => navigate(ROUTES.home)}>Return home</Button>
        </div>
      </div>
    </div>
  );
}
