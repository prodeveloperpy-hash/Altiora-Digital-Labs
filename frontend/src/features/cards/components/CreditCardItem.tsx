import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { CardArtwork } from './CardArtwork';
import { CompareToggleButton } from '@/features/compare/components/CompareToggleButton';
import { CATEGORY_LABELS } from '@/features/cards/constants';
import { ROUTES } from '@/config/constants';
import type { CreditCard } from '@/features/cards/types';

interface CreditCardItemProps {
  card: CreditCard;
  /** Optional highlight badge, e.g. a match label from recommendations. */
  highlight?: string;
}

/** Card summary tile used across listing, search, and recommendation grids. */
export function CreditCardItem({ card, highlight }: CreditCardItemProps) {
  const detailsPath = ROUTES.cardDetails(card.id);

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="relative p-4 pb-0">
        {highlight && (
          <Badge
            variant="primary"
            className="absolute right-6 top-6 z-10 shadow-sm"
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {highlight}
          </Badge>
        )}
        <CardArtwork card={card} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {card.issuer}
          </p>
          <Link
            to={detailsPath}
            className="rounded-sm text-lg font-semibold leading-tight text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {card.name}
          </Link>
          <Rating value={card.rating} reviewCount={card.reviewCount} size="sm" className="pt-0.5" />
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{card.summary}</p>

        <div className="flex flex-wrap gap-1.5">
          {card.categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="secondary">
              {CATEGORY_LABELS[category]}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            to={detailsPath}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            View details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <CompareToggleButton card={card} />
        </div>
      </div>
    </Card>
  );
}
