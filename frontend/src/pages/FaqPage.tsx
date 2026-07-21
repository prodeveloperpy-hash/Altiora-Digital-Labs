import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/Input';
import { Accordion, type AccordionItemData } from '@/components/ui/Accordion';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useFaqs } from '@/features/faq/hooks/useFaqs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Search } from 'lucide-react';
import { ROUTES } from '@/config/constants';
import type { FaqGroup, FaqItem } from '@/features/faq/types';

function groupByCategory(items: FaqItem[]): FaqGroup[] {
  const map = new Map<string, FaqItem[]>();
  for (const item of items) {
    const key = item.category || 'General';
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([category, groupItems]) => ({
    category,
    items: groupItems,
  }));
}

export default function FaqPage() {
  useDocumentTitle('FAQ');
  const query = useFaqs();
  const [search, setSearch] = useState('');

  const groups = useMemo(() => {
    const items = query.data ?? [];
    const term = search.trim().toLowerCase();
    const filtered = term
      ? items.filter(
          (item) =>
            item.question.toLowerCase().includes(term) ||
            item.answer.toLowerCase().includes(term),
        )
      : items;
    return groupByCategory(filtered);
  }, [query.data, search]);

  const hasResults = groups.some((group) => group.items.length > 0);

  return (
    <div className="container max-w-3xl space-y-8 py-10 sm:py-14">
      <PageHeader
        eyebrow="Support"
        title="Frequently asked questions"
        description="Everything you need to know about how our recommendations work."
      />

      {query.isSuccess && (query.data?.length ?? 0) > 0 && (
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          aria-label="Search frequently asked questions"
          startAdornment={<Search className="h-4 w-4" aria-hidden="true" />}
        />
      )}

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !hasResults ? (
        <EmptyState
          icon={HelpCircle}
          title={search ? 'No matching questions' : 'No questions yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Check back soon — our FAQ is being prepared.'
          }
        />
      ) : (
        <div className="space-y-8">
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => {
              const accordionItems: AccordionItemData[] = group.items.map((item) => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
              }));
              return (
                <section key={group.category} className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.category}
                  </h2>
                  <Accordion items={accordionItems} allowMultiple />
                </section>
              );
            })}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">Still have questions?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The fastest way to see how it works is to try it.
        </p>
        <Link
          to={ROUTES.questionnaire}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Get matched
        </Link>
      </div>
    </div>
  );
}
