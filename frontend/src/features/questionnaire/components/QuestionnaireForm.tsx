import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { OptionCards } from '@/components/ui/OptionCards';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/ui/FormField';
import {
  questionnaireSchema,
  questionnaireDefaults,
  type QuestionnaireFormValues,
} from '@/features/questionnaire/schema';
import {
  PRIMARY_GOAL_OPTIONS,
  CREDIT_SCORE_OPTIONS,
  SPENDING_CATEGORY_OPTIONS,
  REWARD_PREFERENCE_OPTIONS,
  QUESTIONNAIRE_STEPS,
} from '@/features/questionnaire/config';
import { useQuestionnaireStore } from '@/features/questionnaire/hooks/useQuestionnaireStore';
import { useToast } from '@/context/toast/useToast';
import { ROUTES } from '@/config/constants';
import { formatCurrency } from '@/lib/utils';

const MAX_SPEND = 15000;
const MAX_FEE = 700;

/** Multi-step, validated questionnaire that produces recommendation inputs. */
export function QuestionnaireForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { answers, saveAnswers } = useQuestionnaireStore();
  const [stepIndex, setStepIndex] = useState(0);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: answers ?? questionnaireDefaults,
    mode: 'onTouched',
  });

  const step = QUESTIONNAIRE_STEPS[stepIndex]!;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === QUESTIONNAIRE_STEPS.length - 1;
  const progress = ((stepIndex + 1) / QUESTIONNAIRE_STEPS.length) * 100;

  const monthlySpend = watch('monthlySpend');
  const maxAnnualFee = watch('maxAnnualFee');

  const handleNext = async () => {
    const valid = await trigger(step.fields, { shouldFocus: true });
    if (valid) setStepIndex((i) => Math.min(i + 1, QUESTIONNAIRE_STEPS.length - 1));
  };

  const handleBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const onSubmit = (values: QuestionnaireFormValues) => {
    saveAnswers(values);
    toast.success('All set!', 'Finding cards that fit your profile…');
    navigate(ROUTES.recommendations);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
      noValidate
    >
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Step {stepIndex + 1} of {QUESTIONNAIRE_STEPS.length}
          </span>
          <span className="font-semibold text-primary">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} label="Questionnaire progress" />
      </div>

      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{step.title}</h2>
        <p className="text-muted-foreground">{step.description}</p>
      </div>

      <div className="min-h-[240px] animate-fade-in" key={step.id}>
        {step.id === 'goal' && (
          <Controller
            control={control}
            name="primaryGoal"
            render={({ field }) => (
              <OptionCards
                ariaLabel="Primary goal"
                options={PRIMARY_GOAL_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                columns={2}
              />
            )}
          />
        )}

        {step.id === 'credit' && (
          <Controller
            control={control}
            name="creditScore"
            render={({ field }) => (
              <OptionCards
                ariaLabel="Credit level"
                options={CREDIT_SCORE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                columns={1}
              />
            )}
          />
        )}

        {step.id === 'spending' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="monthly-spend" className="text-sm font-semibold text-foreground">
                  Approximate monthly spend
                </label>
                <span className="text-base font-bold text-primary">
                  {formatCurrency(monthlySpend)}
                  {monthlySpend >= MAX_SPEND ? '+' : ''}
                </span>
              </div>
              <Controller
                control={control}
                name="monthlySpend"
                render={({ field }) => (
                  <Slider
                    id="monthly-spend"
                    min={0}
                    max={MAX_SPEND}
                    step={100}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-label="Approximate monthly spend"
                  />
                )}
              />
            </div>

            <FormField
              label="Top spending categories"
              hint="Choose the categories where you spend the most."
              error={errors.spendingCategories?.message}
            >
              {() => (
                <Controller
                  control={control}
                  name="spendingCategories"
                  render={({ field }) => (
                    <OptionCards
                      multiple
                      ariaLabel="Spending categories"
                      options={SPENDING_CATEGORY_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      columns={2}
                    />
                  )}
                />
              )}
            </FormField>
          </div>
        )}

        {step.id === 'preferences' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="max-fee" className="text-sm font-semibold text-foreground">
                  Maximum annual fee
                </label>
                <span className="text-base font-bold text-primary">
                  {maxAnnualFee >= MAX_FEE ? 'No limit' : formatCurrency(maxAnnualFee)}
                </span>
              </div>
              <Controller
                control={control}
                name="maxAnnualFee"
                render={({ field }) => (
                  <Slider
                    id="max-fee"
                    min={0}
                    max={MAX_FEE}
                    step={25}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-label="Maximum annual fee"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Preferred rewards style</p>
              <Controller
                control={control}
                name="rewardPreference"
                render={({ field }) => (
                  <OptionCards
                    ariaLabel="Rewards preference"
                    options={REWARD_PREFERENCE_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    columns={2}
                  />
                )}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
              <Controller
                control={control}
                name="travelsInternationally"
                render={({ field }) => (
                  <Checkbox
                    id="travels"
                    label="I travel internationally (prioritize no foreign transaction fees)"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <Controller
                control={control}
                name="carriesBalance"
                render={({ field }) => (
                  <Checkbox
                    id="carries-balance"
                    label="I sometimes carry a balance (prioritize a low APR)"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={handleBack} disabled={isFirst}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        {isLast ? (
          <Button type="submit" size="lg">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            See my matches
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={handleNext}>
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}
