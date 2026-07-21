import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from './queryClient';
import { ThemeProvider } from '@/context/theme/ThemeProvider';
import { ToastProvider } from '@/context/toast/ToastProvider';
import { CompareProvider } from '@/features/compare/context/CompareProvider';
import { env } from '@/config/env';

/**
 * Composes all application-wide providers in one place. Order matters: Theme and
 * Toast wrap the tree so any component (including data components) can use them;
 * QueryClient sits inside so query errors can raise toasts if desired.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // Create the client once per app instance (survives re-renders).
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CompareProvider>{children}</CompareProvider>
        </ToastProvider>
        {env.isDev && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
