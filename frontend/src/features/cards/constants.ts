import type { SelectOption } from '@/types/api';
import type {
  CardCategory,
  CardNetwork,
  CardSortField,
  CreditScoreTier,
} from '@/features/cards/types';

/** Human-readable labels for card categories. */
export const CATEGORY_LABELS: Record<CardCategory, string> = {
  cashback: 'Cash back',
  travel: 'Travel',
  rewards: 'Rewards',
  'balance-transfer': 'Balance transfer',
  'low-interest': 'Low interest',
  student: 'Student',
  business: 'Business',
  secured: 'Secured',
  'no-annual-fee': 'No annual fee',
};

/** Human-readable labels for card networks. */
export const NETWORK_LABELS: Record<CardNetwork, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
};

/** Human-readable labels for credit-score tiers. */
export const CREDIT_SCORE_LABELS: Record<CreditScoreTier, string> = {
  excellent: 'Excellent (720+)',
  good: 'Good (690–719)',
  fair: 'Fair (630–689)',
  poor: 'Poor (below 630)',
  building: 'Building credit',
};

export const CATEGORY_OPTIONS: SelectOption<CardCategory>[] = (
  Object.keys(CATEGORY_LABELS) as CardCategory[]
).map((value) => ({ value, label: CATEGORY_LABELS[value] }));

export const NETWORK_OPTIONS: SelectOption<CardNetwork>[] = (
  Object.keys(NETWORK_LABELS) as CardNetwork[]
).map((value) => ({ value, label: NETWORK_LABELS[value] }));

export const CREDIT_SCORE_OPTIONS: SelectOption<CreditScoreTier>[] = (
  Object.keys(CREDIT_SCORE_LABELS) as CreditScoreTier[]
).map((value) => ({ value, label: CREDIT_SCORE_LABELS[value] }));

export const SORT_OPTIONS: SelectOption<CardSortField>[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'annualFee', label: 'Lowest annual fee' },
  { value: 'apr', label: 'Lowest APR' },
  { value: 'name', label: 'Name (A–Z)' },
];
