import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItemData {
  id: string;
  question: ReactNode;
  answer: ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  /** Allow multiple panels open at once. */
  allowMultiple?: boolean;
  className?: string;
}

/** Accessible accordion built on native buttons + aria-expanded/controls. */
export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn('divide-y divide-border overflow-hidden rounded-xl border border-border bg-card', className)}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const headerId = `${baseId}-${item.id}-header`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 flex-none text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
