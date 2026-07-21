import { Link } from 'react-router-dom';
import { Check, Minus, X } from 'lucide-react';
import { CardArtwork } from '@/features/cards/components/CardArtwork';
import { Rating } from '@/components/ui/Rating';
import { CATEGORY_LABELS, CREDIT_SCORE_LABELS, NETWORK_LABELS } from '@/features/cards/constants';
import { ROUTES } from '@/config/constants';
import { formatAnnualFee, formatAprRange, formatCurrency, formatPercent } from '@/lib/utils';
import type { CreditCard } from '@/features/cards/types';

interface ComparisonTableProps {
  cards: CreditCard[];
  onRemove: (id: string) => void;
}

interface Row {
  label: string;
  render: (card: CreditCard) => React.ReactNode;
}

const ROWS: Row[] = [
  { label: 'Issuer', render: (c) => c.issuer },
  { label: 'Network', render: (c) => NETWORK_LABELS[c.network] },
  {
    label: 'Rating',
    render: (c) => <Rating value={c.rating} reviewCount={c.reviewCount} size="sm" />,
  },
  {
    label: 'Annual fee',
    render: (c) => <span className="font-semibold">{formatAnnualFee(c.annualFee)}</span>,
  },
  { label: 'Purchase APR', render: (c) => formatAprRange(c.aprMin, c.aprMax) },
  { label: 'Intro APR', render: (c) => c.introApr ?? <NotAvailable /> },
  { label: 'Rewards', render: (c) => c.rewardsSummary },
  {
    label: 'Sign-up bonus',
    render: (c) =>
      c.signupBonus ? (
        <span>
          {c.signupBonus}
          {typeof c.signupBonusValue === 'number' && (
            <span className="block text-xs text-muted-foreground">
              ≈ {formatCurrency(c.signupBonusValue)} value
            </span>
          )}
        </span>
      ) : (
        <NotAvailable />
      ),
  },
  {
    label: 'Foreign transaction fee',
    render: (c) =>
      c.foreignTransactionFee > 0 ? (
        formatPercent(c.foreignTransactionFee)
      ) : (
        <span className="inline-flex items-center gap-1 font-medium text-success">
          <Check className="h-4 w-4" aria-hidden="true" />
          None
        </span>
      ),
  },
  {
    label: 'Recommended credit',
    render: (c) => CREDIT_SCORE_LABELS[c.recommendedCreditScore],
  },
  {
    label: 'Categories',
    render: (c) => (
      <div className="flex flex-wrap gap-1">
        {c.categories.map((cat) => (
          <span key={cat} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
            {CATEGORY_LABELS[cat]}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: 'Key benefits',
    render: (c) => (
      <ul className="space-y-1 text-left">
        {c.benefits.slice(0, 5).map((benefit, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-success" aria-hidden="true" />
            <span className="text-xs">{benefit}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

function NotAvailable() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Minus className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Not available</span>
    </span>
  );
}

/** Side-by-side comparison matrix. Scrolls horizontally on small screens. */
export function ComparisonTable({ cards, onRemove }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">Credit card comparison</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 w-40 border-b border-border bg-card p-4 text-left align-bottom"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Feature
              </span>
            </th>
            {cards.map((card) => (
              <th
                key={card.id}
                scope="col"
                className="min-w-[220px] border-b border-l border-border bg-card p-4 align-top"
              >
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onRemove(card.id)}
                      aria-label={`Remove ${card.name} from comparison`}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <CardArtwork card={card} className="mx-auto max-w-[180px]" />
                  <Link
                    to={ROUTES.cardDetails(card.id)}
                    className="block rounded-sm text-center font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {card.name}
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, rowIndex) => (
            <tr key={row.label} className={rowIndex % 2 === 1 ? 'bg-secondary/30' : undefined}>
              <th
                scope="row"
                className="sticky left-0 z-10 border-b border-border bg-inherit p-4 text-left align-top font-medium text-muted-foreground"
              >
                {row.label}
              </th>
              {cards.map((card) => (
                <td
                  key={card.id}
                  className="border-b border-l border-border p-4 align-top text-foreground"
                >
                  {row.render(card)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
