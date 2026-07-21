import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Minus,
  Percent,
  ThumbsDown,
  ThumbsUp,
  Wallet,
  Globe,
  CreditCard as CreditCardIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardArtwork } from '@/features/cards/components/CardArtwork';
import { CompareToggleButton } from '@/features/compare/components/CompareToggleButton';
import { useCard } from '@/features/cards/hooks/useCard';
import {
  CATEGORY_LABELS,
  CREDIT_SCORE_LABELS,
  NETWORK_LABELS,
} from '@/features/cards/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { isApiError } from '@/lib/apiError';
import { ROUTES } from '@/config/constants';
import {
  formatAnnualFee,
  formatAprRange,
  formatCurrency,
  formatPercent,
} from '@/lib/utils';
import type { CreditCard, RewardRate } from '@/features/cards/types';

function DetailsSkeleton() {
  return (
    <div className="container py-10">
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <Skeleton className="aspect-[1.586/1] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-11 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function rewardRateLabel(rate: RewardRate): string {
  const amount =
    rate.unit === 'percent' ? `${rate.rate}%` : `${rate.rate}x ${rate.unit}`;
  return `${amount} on ${rate.category}${rate.cap ? ` (${rate.cap})` : ''}`;
}

function CardDetails({ card }: { card: CreditCard }) {
  const applyDisabled = !card.applyUrl;
  return (
    <div className="container space-y-10 py-10 sm:py-12">
      <Link
        to={ROUTES.search}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to browse
      </Link>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <CardArtwork card={card} />
          <div className="flex flex-col gap-2">
            <a
              href={card.applyUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={applyDisabled}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                applyDisabled ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              Apply on issuer&rsquo;s site
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <CompareToggleButton card={card} size="lg" fullWidth />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            You&rsquo;ll finish your application securely on {card.issuer}&rsquo;s website.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {card.issuer} · {NETWORK_LABELS[card.network]}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {card.name}
            </h1>
            <Rating value={card.rating} reviewCount={card.reviewCount} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {card.categories.map((category) => (
              <Badge key={category} variant="primary">
                {CATEGORY_LABELS[category]}
              </Badge>
            ))}
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">{card.description}</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Wallet} label="Annual fee" value={formatAnnualFee(card.annualFee)} />
            <StatTile
              icon={Percent}
              label="Purchase APR"
              value={`${card.aprMin.toFixed(2)}%+`}
            />
            <StatTile
              icon={Globe}
              label="Foreign fee"
              value={card.foreignTransactionFee > 0 ? formatPercent(card.foreignTransactionFee) : 'None'}
            />
            <StatTile
              icon={CreditCardIcon}
              label="Credit needed"
              value={CREDIT_SCORE_LABELS[card.recommendedCreditScore].split(' (')[0] ?? ''}
            />
          </div>

          {card.signupBonus && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-primary">Welcome bonus</p>
              <p className="mt-1 text-foreground">{card.signupBonus}</p>
              {typeof card.signupBonusValue === 'number' && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Estimated value: {formatCurrency(card.signupBonusValue)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rewards */}
      {card.rewardRates.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Rewards</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {card.rewardRates.map((rate, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-success/10 text-success">
                  <Percent className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-foreground">{rewardRateLabel(rate)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Details grid: APR/fees + benefits */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Rates &amp; fees</h2>
          <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {[
              { label: 'Annual fee', value: formatAnnualFee(card.annualFee) },
              { label: 'Purchase APR', value: formatAprRange(card.aprMin, card.aprMax) },
              { label: 'Intro APR', value: card.introApr ?? 'Not available' },
              {
                label: 'Foreign transaction fee',
                value:
                  card.foreignTransactionFee > 0
                    ? formatPercent(card.foreignTransactionFee)
                    : 'None',
              },
              {
                label: 'Recommended credit',
                value: CREDIT_SCORE_LABELS[card.recommendedCreditScore],
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 bg-card p-4">
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-sm font-semibold text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Benefits</h2>
          <ul className="space-y-2.5 rounded-xl border border-border bg-card p-5">
            {card.benefits.length > 0 ? (
              card.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-success" aria-hidden="true" />
                  {benefit}
                </li>
              ))
            ) : (
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Minus className="h-4 w-4" aria-hidden="true" />
                No additional benefits listed.
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* Pros & cons */}
      {(card.pros.length > 0 || card.cons.length > 0) && (
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-success/30 bg-success/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ThumbsUp className="h-5 w-5 text-success" aria-hidden="true" />
              Pros
            </h2>
            <ul className="mt-3 space-y-2">
              {card.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-success" aria-hidden="true" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ThumbsDown className="h-5 w-5 text-destructive" aria-hidden="true" />
              Cons
            </h2>
            <ul className="mt-3 space-y-2">
              {card.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <Minus className="mt-0.5 h-4 w-4 flex-none text-destructive" aria-hidden="true" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default function CardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = useCard(id);
  useDocumentTitle(query.data?.name);

  if (query.isLoading) return <DetailsSkeleton />;

  if (query.isError) {
    const notFound = isApiError(query.error) && query.error.status === 404;
    return (
      <div className="container py-16">
        <ErrorState
          error={query.error}
          title={notFound ? 'Card not found' : undefined}
          description={
            notFound
              ? 'This card may have been removed or the link is incorrect.'
              : undefined
          }
          onRetry={notFound ? undefined : () => query.refetch()}
          isRetrying={query.isFetching}
        />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => navigate(ROUTES.search)}>
            Browse all cards
          </Button>
        </div>
      </div>
    );
  }

  if (!query.data) return null;
  return <CardDetails card={query.data} />;
}
