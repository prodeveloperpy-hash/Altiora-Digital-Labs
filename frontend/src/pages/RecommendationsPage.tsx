import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import { ROUTES, STORAGE_KEYS } from '@/config/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CompareToggleButton } from '@/features/compare/components/CompareToggleButton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { CreditCard } from '@/features/cards/types';

interface Recommendation {
  card: CreditCard;
  ranking: number;
  score: number;
  matchPercentage: number;
  matchedBenefits: string[];
  missingBenefits: string[];
  explanation: string;
}

interface RecommendationResponse {
  recommendations: Recommendation[];
  selectedCount: number;
}

function selectedBenefits(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.recommendationBenefits) ?? '[]');
  } catch {
    return [];
  }
}

export default function RecommendationsPage() {
  useDocumentTitle('Recommendations');
  const benefits = selectedBenefits();
  const query = useQuery({
    queryKey: ['recommendations', benefits],
    queryFn: () =>
      apiClient.post<RecommendationResponse, { benefits: string[] }>('/recommend', { benefits }),
    enabled: benefits.length > 0,
  });

  if (!benefits.length) {
    return <div className="container py-14"><EmptyState title="Choose your preferences first" description="Use the homepage questionnaire to select at least one benefit." action={<Link className="text-primary underline" to={ROUTES.home}>Open questionnaire</Link>} /></div>;
  }
  if (query.isLoading) return <LoadingState label="Ranking every supported card…" />;
  if (query.isError) return <div className="container py-14"><ErrorState error={query.error} onRetry={() => query.refetch()} /></div>;

  return (
    <div className="container space-y-8 py-10 sm:py-14">
      <PageHeader title="Your top card recommendations" description={`Every supported card was scored against your ${benefits.length} selected requirements.`} />
      <div className="space-y-6">
        {query.data?.recommendations.map((match) => {
          const card = match.card;
          return (
            <article key={card.id} className="grid gap-6 rounded-2xl border bg-card p-6 shadow-card lg:grid-cols-[220px_1fr]">
              <div>
                {card.imageUrl ? <img src={card.imageUrl} alt={`${card.name} card`} className="w-full rounded-xl" /> : <div className="flex aspect-[1.586] items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent p-5 text-center font-bold text-primary-foreground">{card.name}</div>}
                <p className="mt-3 text-center text-2xl font-bold text-primary">{match.matchPercentage}% match</p>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">#{match.ranking} · Score {match.score}</p>
                <h2 className="mt-1 text-2xl font-bold">{card.name}</h2>
                <p className="text-muted-foreground">{card.issuer}</p>
                <p className="mt-3">{match.explanation}</p>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div><dt className="font-semibold">Annual fee</dt><dd>₹{card.annualFee}</dd></div>
                  <div><dt className="font-semibold">Joining fee</dt><dd>₹{card.joiningFee}</dd></div>
                  <div><dt className="font-semibold">Fee waiver</dt><dd>{card.feeWaiver || 'None stated'}</dd></div>
                  <div><dt className="font-semibold">Reward rate</dt><dd>{card.rewardRate || 'Not stated'}</dd></div>
                  <div><dt className="font-semibold">Cashback</dt><dd>{card.cashbackCategories || 'None stated'}</dd></div>
                  <div><dt className="font-semibold">Lounge access</dt><dd>{[card.loungeDomestic, card.loungeInternational].filter(Boolean).join('; ') || 'None stated'}</dd></div>
                  <div><dt className="font-semibold">Insurance</dt><dd>{card.insurance || 'None stated'}</dd></div>
                  <div><dt className="font-semibold">Fuel</dt><dd>{card.fuel || 'None stated'}</dd></div>
                  <div><dt className="font-semibold">Shopping</dt><dd>{card.shopping || 'None stated'}</dd></div>
                  <div><dt className="font-semibold">Travel</dt><dd>{card.travel || 'None stated'}</dd></div>
                  <div><dt className="font-semibold">Eligibility</dt><dd>{card.eligibility}</dd></div>
                  <div><dt className="font-semibold">Income requirement</dt><dd>{card.incomeRequirement}</dd></div>
                </dl>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <p className="rounded-lg bg-success/10 p-3 text-sm"><strong>Matched:</strong> {match.matchedBenefits.join(', ') || 'None'}</p>
                  <p className="rounded-lg bg-secondary p-3 text-sm"><strong>Missing:</strong> {match.missingBenefits.join(', ') || 'None'}</p>
                  <p className="text-sm"><strong>Pros:</strong> {card.pros.join(', ') || 'None stated'}</p>
                  <p className="text-sm"><strong>Cons:</strong> {card.cons.join(', ') || 'None stated'}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <CompareToggleButton card={card} />
                  <Link to={ROUTES.cardDetails(card.id)} className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">View details</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
