import { CreditCardItem } from './CreditCardItem';
import type { CreditCard } from '@/features/cards/types';
import { cn } from '@/lib/utils';

interface CardGridProps {
  cards: CreditCard[];
  className?: string;
}

/** Responsive grid of credit card tiles with a staggered entrance animation. */
export function CardGrid({ cards, className }: CardGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
        >
          <CreditCardItem card={card} />
        </div>
      ))}
    </div>
  );
}
