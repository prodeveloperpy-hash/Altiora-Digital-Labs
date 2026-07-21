import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ToastContext,
  type Toast,
  type ToastInput,
  type ToastVariant,
} from './ToastContext';
import { ToastViewport } from '@/components/feedback/ToastViewport';

const DEFAULT_DURATION = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const counter = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (input: ToastInput): string => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      const toast: Toast = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'info',
        duration: input.duration ?? DEFAULT_DURATION,
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        const timer = setTimeout(() => dismissToast(id), toast.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismissToast],
  );

  const makeVariant = useCallback(
    (variant: ToastVariant) => (title: string, description?: string) =>
      addToast({ title, description, variant }),
    [addToast],
  );

  const clearToasts = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      success: makeVariant('success'),
      error: makeVariant('error'),
      warning: makeVariant('warning'),
      info: makeVariant('info'),
      dismissToast,
      clearToasts,
    }),
    [toasts, addToast, makeVariant, dismissToast, clearToasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
