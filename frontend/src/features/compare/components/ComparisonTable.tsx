import { Link } from 'react-router-dom';
import { Minus, X } from 'lucide-react';
import { CardArtwork } from '@/features/cards/components/CardArtwork';
import { NETWORK_LABELS } from '@/features/cards/constants';
import { ROUTES } from '@/config/constants';
import { formatAnnualFee, formatCurrency } from '@/lib/utils';
import type { CreditCard } from '@/features/cards/types';

interface Props { cards: CreditCard[]; onRemove: (id: string) => void }
interface Row { label: string; render: (card: CreditCard) => React.ReactNode }
const value = (text: string) => text || <NotAvailable />;

/** The 28-row PRD comparison matrix. */
const ROWS: Row[] = [
  { label: 'Bank', render: (c) => c.issuer },
  { label: 'Card type', render: (c) => value(c.cardType) },
  { label: 'Network', render: (c) => NETWORK_LABELS[c.network] },
  { label: 'Joining fee', render: (c) => formatCurrency(c.joiningFee) },
  { label: 'Annual fee', render: (c) => formatAnnualFee(c.annualFee) },
  { label: 'Fee waiver', render: (c) => value(c.feeWaiver) },
  { label: 'Eligibility', render: (c) => value(c.eligibility) },
  { label: 'Income requirement', render: (c) => value(c.incomeRequirement) },
  { label: 'Reward rate', render: (c) => value(c.rewardRate) },
  { label: 'Reward points', render: (c) => value(c.rewardPoints) },
  { label: 'Cashback categories', render: (c) => value(c.cashbackCategories) },
  { label: 'Domestic lounge access', render: (c) => value(c.loungeDomestic) },
  { label: 'International lounge access', render: (c) => value(c.loungeInternational) },
  { label: 'Insurance', render: (c) => value(c.insurance) },
  { label: 'Fuel', render: (c) => value(c.fuel) },
  { label: 'Dining', render: (c) => value(c.dining) },
  { label: 'Shopping', render: (c) => value(c.shopping) },
  { label: 'Travel', render: (c) => value(c.travel) },
  { label: 'Forex', render: (c) => value(c.forex) },
  { label: 'UPI', render: (c) => value(c.upi) },
  { label: 'Concierge', render: (c) => value(c.concierge) },
  { label: 'Golf', render: (c) => value(c.golf) },
  { label: 'Welcome bonus', render: (c) => value(c.welcomeBonus) },
  { label: 'Renewal benefits', render: (c) => value(c.renewalBenefits) },
  { label: 'Add-on cards', render: (c) => value(c.addOnCards) },
  { label: 'EMI conversion', render: (c) => value(c.emiConversion) },
  { label: 'Balance transfer', render: (c) => value(c.balanceTransfer) },
  { label: 'Merchant offers', render: (c) => value(c.merchantOffers) },
];

function NotAvailable() {
  return <span className="inline-flex text-muted-foreground"><Minus className="h-4 w-4" /><span className="sr-only">Not available</span></span>;
}

export function ComparisonTable({ cards, onRemove }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">Credit card comparison</caption>
        <thead><tr>
          <th className="sticky left-0 z-10 w-48 border-b bg-card p-4 text-left">Feature</th>
          {cards.map((card) => <th key={card.id} className="min-w-[240px] border-b border-l bg-card p-4">
            <button onClick={() => onRemove(card.id)} aria-label={`Remove ${card.name}`} className="float-right"><X className="h-4 w-4" /></button>
            <CardArtwork card={card} className="mx-auto max-w-[180px]" />
            <Link to={ROUTES.cardDetails(card.id)} className="mt-3 block font-semibold hover:text-primary">{card.name}</Link>
          </th>)}
        </tr></thead>
        <tbody>{ROWS.map((row, index) => <tr key={row.label} className={index % 2 ? 'bg-secondary/30' : undefined}>
          <th scope="row" className="sticky left-0 border-b bg-inherit p-4 text-left text-muted-foreground">{row.label}</th>
          {cards.map((card) => <td key={card.id} className="border-b border-l p-4 align-top">{row.render(card)}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  );
}
