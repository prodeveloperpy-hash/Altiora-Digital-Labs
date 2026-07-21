import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Base skeleton block with a shimmer sweep. Compose these into higher-level
 * skeleton loaders (see components/feedback and feature skeletons).
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton-shimmer rounded-md bg-muted/70', className)}
      {...props}
    />
  );
}
