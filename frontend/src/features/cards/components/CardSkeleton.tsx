import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/** Skeleton placeholder matching the CreditCardItem layout. */
export function CardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="p-4 pb-0">
        <Skeleton className="aspect-[1.586/1] w-full rounded-xl" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="mt-auto flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </Card>
  );
}

/** Grid of card skeletons for list/search loading states. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
