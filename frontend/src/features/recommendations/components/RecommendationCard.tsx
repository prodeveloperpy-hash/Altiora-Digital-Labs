import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { CardArtwork } from '@/features/cards/components/CardArtwork';
import { CompareToggleButton } from '@/features/compare/components/CompareToggleButton';
import { MatchScore } from './MatchScore';
import { CATEGORY_LABELS } from '@/features/cards/constants';
import { ROUTES } from '@/config/constants';
import { cn, formatAnnualFee } from '@/lib/utils';
import type { Recommendation } from '@/features/recommendations/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  rank: number;
}

/** A rich recommendation row: artwork, match score, and the reasons it matched. */
export function RecommendationCard({ recommendation, rank }: RecommendationCardProps) {
  const { card, matchScore, reasons, highlight } = recommendation;
  const detailsPath = ROUTES.cardDetails(card.id);
  const isTop = rank === 1;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-elevated',
        isTop && 'ring-2 ring-primary/40',
      )}
    >
      {isTop && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          {highlight ?? 'Best overall match'}
        </div>
      )}
      <div className="grid gap-5 p-5 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
        <div className="space-y-3">
          <CardArtwork card={card} />
          <div className="flex items-center justify-between">
            <MatchScore score={matchScore} />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Annual fee</p>
              <p className="text-sm font-semibold text-foreground">
                {formatAnnualFee(card.annualFee)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.issuer}
              </p>
              <Link
                to={detailsPath}
                className="rounded-sm text-xl font-semibold leading-tight text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {card.name}
              </Link>
              <Rating value={card.rating} reviewCount={card.reviewCount} size="sm" />
            </div>
            {!isTop && highlight && <Badge variant="primary">{highlight}</Badge>}
          </div>

          <p className="text-sm text-muted-foreground">{card.summary}</p>

          <div className="flex flex-wrap gap-1.5">
            {card.categories.slice(0, 4).map((category) => (
              <Badge key={category} variant="secondary">
                {CATEGORY_LABELS[category]}
              </Badge>
            ))}
          </div>

          {reasons.length > 0 && (
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Why it matches you
              </p>
              <ul className="space-y-1.5">
                {reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 flex-none text-success"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="font-medium">{reason.label}.</span>{' '}
                      <span className="text-muted-foreground">{reason.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            <Link
              to={detailsPath}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <CompareToggleButton card={card} size="md" />
          </div>
        </div>
      </div>
    </Card>
  );
}
