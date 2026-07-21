import { z } from 'zod';

/**
 * Validation schema for the recommendation questionnaire. The inferred type is
 * kept structurally compatible with QuestionnaireAnswers (see ./types).
 */
export const questionnaireSchema = z.object({
  primaryGoal: z.enum(
    [
      'cashback',
      'travel',
      'rewards',
      'balance-transfer',
      'low-interest',
      'student',
      'business',
      'secured',
      'no-annual-fee',
    ],
    { message: 'Please choose what matters most to you.' },
  ),
  creditScore: z.enum(['excellent', 'good', 'fair', 'poor', 'building'], {
    message: 'Please select your credit level.',
  }),
  monthlySpend: z
    .number({ message: 'Enter your approximate monthly spend.' })
    .int()
    .min(0, 'Monthly spend cannot be negative.')
    .max(100000, 'Please enter a realistic monthly spend.'),
  spendingCategories: z
    .array(z.string())
    .min(1, 'Select at least one spending category.')
    .max(6, 'Select up to six categories.'),
  maxAnnualFee: z
    .number({ message: 'Set your maximum annual fee.' })
    .int()
    .min(0, 'Annual fee cannot be negative.')
    .max(1000, 'Please enter a realistic annual fee.'),
  travelsInternationally: z.boolean(),
  carriesBalance: z.boolean(),
  rewardPreference: z.enum(['cashback', 'points', 'miles', 'no-preference'], {
    message: 'Select your preferred rewards style.',
  }),
});

export type QuestionnaireFormValues = z.infer<typeof questionnaireSchema>;

/** Sensible defaults so the form is valid-by-construction where possible. */
export const questionnaireDefaults: QuestionnaireFormValues = {
  primaryGoal: 'cashback',
  creditScore: 'good',
  monthlySpend: 1500,
  spendingCategories: [],
  maxAnnualFee: 100,
  travelsInternationally: false,
  carriesBalance: false,
  rewardPreference: 'no-preference',
};
