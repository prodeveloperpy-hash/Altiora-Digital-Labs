import { apiClient } from '@/lib/apiClient';
import type { FaqItem } from '@/features/faq/types';

/**
 * FAQ API.
 *   GET /faqs → list of frequently asked questions with categories.
 */
export const faqApi = {
  list(signal?: AbortSignal): Promise<FaqItem[]> {
    return apiClient.get<FaqItem[]>('/faqs', { signal });
  },
};
