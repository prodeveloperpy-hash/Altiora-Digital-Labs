/** Domain types for the FAQ feature. */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/** FAQ items grouped by category for sectioned rendering. */
export interface FaqGroup {
  category: string;
  items: FaqItem[];
}
