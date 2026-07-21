import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RecommendationCard } from '@/features/recommendations/components/RecommendationCard';
import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations';
import { useQuestionnaireStore } from '@/features/questionnaire/hooks/useQuestionnaireStore';
import { CATEGORY_LABELS, CREDIT_SCORE_LABELS } from '@/features/cards/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/config/constants';
import { formatCurrency } from '@/lib/utils';

function RecommendationSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid gap-5 md:grid-cols-[240px_1fr]">
        <Skeleton className="aspect-[1.586/1] w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  useDocumentTitle('Your recommendations');
  const { answers } = useQuestionnaireStore();
  const query = useRecommendations(answers);

  // No answers yet — guide the user to the questionnaire.
  if (!answers) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ClipboardList}
          title="No recommendations yet"
          description="Complete the short questionnaire and we'll match you with cards tailored to your profile."
          action={
            <Link
              to={ROUTES.questionnaire}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Start the questionnaire
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container space-y-8 py-10 sm:py-14">
      <PageHeader
        eyebrow="Your matches"
        title="Cards picked for you"
        description="Ranked by how well each card fits the goals, credit, and spending you told us about."
        actions={
          <Button
            variant="outline"
            onClick={() => query.refetch()}
            isLoading={query.isFetching && !query.isLoading}
            loadingText="Refreshing…"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      {/* Answer summary */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/60 p-4">
        <span className="text-sm font-medium text-muted-foreground">Based on:</span>
        <Badge variant="secondary">Goal: {CATEGORY_LABELS[answers.primaryGoal]}</Badge>
        <Badge variant="secondary">Credit: {CREDIT_SCORE_LABELS[answers.creditScore]}</Badge>
        <Badge variant="secondary">Spend: {formatCurrency(answers.monthlySpend)}/mo</Badge>
        <Badge variant="secondary">
          Max fee: {answers.maxAnnualFee >= 700 ? 'No limit' : formatCurrency(answers.maxAnnualFee)}
        </Badge>
        <Link
          to={ROUTES.questionnaire}
          className="ml-auto text-sm font-semibold text-primary hover:underline"
        >
          Edit answers
        </Link>
      </div>

      {query.isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }, (_, i) => (
            <RecommendationSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !query.data || query.data.recommendations.length === 0 ? (
        <EmptyState
          title="No strong matches found"
          description="Try adjusting your answers — for example, raising your maximum annual fee or broadening your goal."
          action={
            <Link
              to={ROUTES.questionnaire}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Adjust answers
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {query.data.recommendations.length} of {query.data.evaluatedCount} cards
            evaluated.
          </p>
          <div className="space-y-6">
            {query.data.recommendations.map((recommendation, index) => (
              <div
                key={recommendation.card.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
              >
                <RecommendationCard recommendation={recommendation} rank={index + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
