import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  /** Auto-dismiss delay in ms. Use 0 to disable auto-dismiss. */
  duration: number;
}

export type ToastInput = Omit<Toast, 'id' | 'variant' | 'duration'> &
  Partial<Pick<Toast, 'variant' | 'duration'>>;

export interface ToastContextValue {
  toasts: Toast[];
  /** Add a toast and return its generated id. */
  addToast: (toast: ToastInput) => string;
  /** Convenience helpers per variant. */
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
