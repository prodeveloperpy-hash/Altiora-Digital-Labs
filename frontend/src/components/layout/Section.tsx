import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** A vertically-padded page section wrapped in the responsive container. */
export function Section({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('py-10 sm:py-14', className)} {...props}>
      <div className="container">{children}</div>
    </section>
  );
}
