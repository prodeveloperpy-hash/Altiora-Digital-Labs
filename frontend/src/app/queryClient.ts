import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/lib/apiError';

/**
 * Centralized TanStack Query configuration. Retries are disabled for 4xx client
 * errors (retrying won't help), and capped for everything else.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1 minute — card data changes infrequently.
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
