import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary that catches render-time exceptions anywhere in the
 * tree and shows a recoverable fallback instead of a blank screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error for observability. Replace with a real logger/Sentry hook.
    console.error('Uncaught error in React tree:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.assign('/');
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10 text-center shadow-card">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertOctagon className="h-8 w-8" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-foreground">The app hit a snag</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. You can try again, or return to the homepage.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
            <Button onClick={this.handleReload}>Go home</Button>
          </div>
        </div>
      </div>
    );
  }
}
