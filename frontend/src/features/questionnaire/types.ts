import type { CardCategory, CreditScoreTier } from '@/features/cards/types';

/** Answers collected by the recommendation questionnaire. */
export interface QuestionnaireAnswers {
  /** What the user primarily wants from a card. */
  primaryGoal: CardCategory;
  /** Self-reported credit standing. */
  creditScore: CreditScoreTier;
  /** Approximate monthly spend in USD. */
  monthlySpend: number;
  /** Spending categories the user cares about most. */
  spendingCategories: string[];
  /** Maximum annual fee the user is comfortable paying. */
  maxAnnualFee: number;
  /** Whether the user travels internationally (affects FX fee weighting). */
  travelsInternationally: boolean;
  /** Whether the user carries a balance month to month (affects APR weighting). */
  carriesBalance: boolean;
  /** Preferred rewards style. */
  rewardPreference: 'cashback' | 'points' | 'miles' | 'no-preference';
}
