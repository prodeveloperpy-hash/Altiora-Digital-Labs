import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  /** Value from 0 to `max`. */
  value: number;
  max?: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/** Read-only star rating with an accessible text label. */
export function Rating({ value, max = 5, reviewCount, size = 'md', className }: RatingProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="inline-flex" aria-hidden="true">
        {Array.from({ length: max }, (_, index) => {
          const fill = Math.max(0, Math.min(1, clamped - index));
          return (
            <span key={index} className="relative inline-block">
              <Star className={cn(starSize, 'text-muted-foreground/30')} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn(starSize, 'fill-warning text-warning')} />
              </span>
            </span>
          );
        })}
      </div>
      <span className={cn('font-medium text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {clamped.toFixed(1)}
      </span>
      {typeof reviewCount === 'number' && (
        <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
      <span className="sr-only">
        Rated {clamped.toFixed(1)} out of {max}
        {typeof reviewCount === 'number' ? ` from ${reviewCount} reviews` : ''}
      </span>
    </div>
  );
}
