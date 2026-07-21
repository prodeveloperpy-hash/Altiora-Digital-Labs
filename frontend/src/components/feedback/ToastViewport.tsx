import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import type { Toast, ToastVariant } from '@/context/toast/ToastContext';
import { cn } from '@/lib/utils';

const variantConfig: Record<
  ToastVariant,
  { icon: typeof Info; ring: string; iconColor: string }
> = {
  success: { icon: CheckCircle2, ring: 'border-l-success', iconColor: 'text-success' },
  error: { icon: XCircle, ring: 'border-l-destructive', iconColor: 'text-destructive' },
  warning: { icon: AlertTriangle, ring: 'border-l-warning', iconColor: 'text-warning' },
  info: { icon: Info, ring: 'border-l-primary', iconColor: 'text-primary' },
};

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

/** Renders the stack of active toasts in a portal at the top-right of the screen. */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-3 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant];
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-slide-in-right items-start gap-3 rounded-xl border border-l-4 border-border bg-card p-4 shadow-elevated',
              config.ring,
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 flex-none', config.iconColor)} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
