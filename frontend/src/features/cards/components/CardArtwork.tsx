import { useState } from 'react';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { NETWORK_LABELS } from '@/features/cards/constants';
import type { CreditCard } from '@/features/cards/types';
import { cn } from '@/lib/utils';

interface CardArtworkProps {
  card: Pick<CreditCard, 'name' | 'issuer' | 'network' | 'imageUrl'>;
  className?: string;
}

/**
 * Renders a card's artwork with a graceful gradient fallback when the image is
 * missing or fails to load, so the UI never shows a broken image icon.
 */
export function CardArtwork({ card, className }: CardArtworkProps) {
  const [failed, setFailed] = useState(false);
  const showImage = card.imageUrl && !failed;

  return (
    <div
      className={cn(
        'relative flex aspect-[1.586/1] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/90 via-primary to-accent shadow-md',
        className,
      )}
    >
      {showImage ? (
        <img
          src={card.imageUrl}
          alt={`${card.issuer} ${card.name}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <CreditCardIcon className="h-7 w-7 opacity-90" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
              {NETWORK_LABELS[card.network]}
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide opacity-80">{card.issuer}</p>
            <p className="text-sm font-semibold leading-tight">{card.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
