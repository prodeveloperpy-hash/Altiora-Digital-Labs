import { useQuery } from '@tanstack/react-query';
import { faqApi } from '@/features/faq/api/faqApi';
import { queryKeys } from '@/lib/queryKeys';

/** Fetch the list of FAQ items. */
export function useFaqs() {
  return useQuery({
    queryKey: queryKeys.faqs.all,
    queryFn: ({ signal }) => faqApi.list(signal),
    staleTime: 10 * 60_000,
  });
}
