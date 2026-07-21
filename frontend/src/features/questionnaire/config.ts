import type { SelectOption } from '@/types/api';
import { CATEGORY_LABELS, CREDIT_SCORE_LABELS } from '@/features/cards/constants';
import type { CardCategory, CreditScoreTier } from '@/features/cards/types';

/**
 * Static form configuration for the questionnaire. These are UI option
 * definitions (the shape of the form), not backend domain data — the user's
 * answers are POSTed to the recommendations endpoint for rules-based matching.
 */

export const PRIMARY_GOAL_OPTIONS: SelectOption<CardCategory>[] = [
  { value: 'cashback', label: CATEGORY_LABELS.cashback, description: 'Earn cash on everyday spending.' },
  { value: 'travel', label: CATEGORY_LABELS.travel, description: 'Miles, lounge access, and travel perks.' },
  { value: 'rewards', label: CATEGORY_LABELS.rewards, description: 'Flexible points across categories.' },
  {
    value: 'balance-transfer',
    label: CATEGORY_LABELS['balance-transfer'],
    description: 'Move existing debt to a lower rate.',
  },
  {
    value: 'low-interest',
    label: CATEGORY_LABELS['low-interest'],
    description: 'Keep interest costs down over time.',
  },
  { value: 'student', label: CATEGORY_LABELS.student, description: 'Build credit as a student.' },
  { value: 'business', label: CATEGORY_LABELS.business, description: 'Tools and rewards for your business.' },
  { value: 'secured', label: CATEGORY_LABELS.secured, description: 'Rebuild credit with a deposit.' },
];

export const CREDIT_SCORE_OPTIONS: SelectOption<CreditScoreTier>[] = (
  Object.keys(CREDIT_SCORE_LABELS) as CreditScoreTier[]
).map((value) => ({ value, label: CREDIT_SCORE_LABELS[value] }));

export const SPENDING_CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'dining', label: 'Dining & restaurants' },
  { value: 'travel', label: 'Travel & hotels' },
  { value: 'gas', label: 'Gas & transit' },
  { value: 'online-shopping', label: 'Online shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'streaming', label: 'Streaming services' },
  { value: 'utilities', label: 'Bills & utilities' },
];

export const REWARD_PREFERENCE_OPTIONS: SelectOption<
  'cashback' | 'points' | 'miles' | 'no-preference'
>[] = [
  { value: 'cashback', label: 'Cash back', description: 'Simple, redeemable as statement credit.' },
  { value: 'points', label: 'Points', description: 'Flexible, transferable to partners.' },
  { value: 'miles', label: 'Miles', description: 'Best for frequent travelers.' },
  { value: 'no-preference', label: 'No preference', description: 'Show me the best value overall.' },
];

/** The ordered steps of the questionnaire wizard. */
export interface QuestionnaireStep {
  id: string;
  title: string;
  description: string;
  /** Fields validated when advancing past this step. */
  fields: readonly (keyof import('./schema').QuestionnaireFormValues)[];
}

export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: 'goal',
    title: 'What matters most?',
    description: 'Tell us the main reason you want a new card.',
    fields: ['primaryGoal'],
  },
  {
    id: 'credit',
    title: 'Your credit profile',
    description: 'This helps us match cards you are likely to qualify for.',
    fields: ['creditScore'],
  },
  {
    id: 'spending',
    title: 'How you spend',
    description: 'Your typical monthly spend and top categories.',
    fields: ['monthlySpend', 'spendingCategories'],
  },
  {
    id: 'preferences',
    title: 'Fees & rewards',
    description: 'Fine-tune fees, rewards style, and how you use credit.',
    fields: ['maxAnnualFee', 'rewardPreference', 'travelsInternationally', 'carriesBalance'],
  },
];
