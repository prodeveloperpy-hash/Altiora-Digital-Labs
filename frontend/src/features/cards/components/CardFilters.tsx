import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { cardsApi } from '@/features/cards/api/cardsApi';
import type { CardListParams } from '@/features/cards/types';

interface Props {
  filters: CardListParams;
  onChange: (updates: Partial<CardListParams>) => void;
  onClear: () => void;
  activeFilterCount: number;
}

export function CardFilters({ filters, onChange, onClear, activeFilterCount }: Props) {
  const catalog = useQuery({ queryKey: ['filters'], queryFn: ({ signal }) => cardsApi.filters(signal) });
  const toggleBenefit = (code: string, checked: boolean) => {
    const current = filters.benefits ?? [];
    onChange({ benefits: checked ? [...current, code] : current.filter((item) => item !== code) });
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {activeFilterCount > 0 && <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{activeFilterCount}</span>}
        </h2>
        {activeFilterCount > 0 && <Button variant="link" onClick={onClear}><X className="h-3.5 w-3.5" />Clear</Button>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-bank" className="text-sm font-medium">Bank</label>
        <Select id="filter-bank" value={filters.bank ?? ''} onChange={(e) => onChange({ bank: e.target.value || undefined })}>
          <option value="">All 6 banks</option>
          {catalog.data?.banks.map((bank) => <option key={bank.slug} value={bank.slug}>{bank.name}</option>)}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-fee" className="text-sm font-medium">Fees</label>
        <Select id="filter-fee" value={filters.fee ?? ''} onChange={(e) => onChange({ fee: e.target.value || undefined })}>
          <option value="">Any fee</option>
          {catalog.data?.fees.map((fee) => <option key={fee.code} value={fee.code}>{fee.name}</option>)}
        </Select>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Benefits</legend>
        {catalog.data?.benefits.map((benefit) => (
          <Checkbox key={benefit.code} id={`benefit-${benefit.code}`} label={benefit.name}
            checked={filters.benefits?.includes(benefit.code) ?? false}
            onChange={(e) => toggleBenefit(benefit.code, e.target.checked)} />
        ))}
      </fieldset>
    </div>
  );
}
