import { SlidersHorizontal, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import {
  CATEGORY_OPTIONS,
  CREDIT_SCORE_OPTIONS,
  NETWORK_OPTIONS,
} from '@/features/cards/constants';
import { formatCurrency } from '@/lib/utils';
import type { CardListParams } from '@/features/cards/types';
import type { CardCategory, CardNetwork, CreditScoreTier } from '@/features/cards/types';

interface CardFiltersProps {
  filters: CardListParams;
  onChange: (updates: Partial<CardListParams>) => void;
  onClear: () => void;
  activeFilterCount: number;
}

const MAX_FEE = 700;

/** Filter panel for the search/browse experience. */
export function CardFilters({ filters, onChange, onClear, activeFilterCount }: CardFiltersProps) {
  const feeValue = filters.maxAnnualFee ?? MAX_FEE;

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <Button variant="link" onClick={onClear} className="text-xs">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-category" className="text-sm font-medium text-foreground">
          Category
        </label>
        <Select
          id="filter-category"
          value={filters.category ?? ''}
          onChange={(e) =>
            onChange({ category: (e.target.value || undefined) as CardCategory | undefined })
          }
        >
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-network" className="text-sm font-medium text-foreground">
          Network
        </label>
        <Select
          id="filter-network"
          value={filters.network ?? ''}
          onChange={(e) =>
            onChange({ network: (e.target.value || undefined) as CardNetwork | undefined })
          }
        >
          <option value="">All networks</option>
          {NETWORK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-credit" className="text-sm font-medium text-foreground">
          Your credit
        </label>
        <Select
          id="filter-credit"
          value={filters.creditScore ?? ''}
          onChange={(e) =>
            onChange({ creditScore: (e.target.value || undefined) as CreditScoreTier | undefined })
          }
        >
          <option value="">Any credit level</option>
          {CREDIT_SCORE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="filter-fee" className="text-sm font-medium text-foreground">
            Max annual fee
          </label>
          <span className="text-sm font-semibold text-primary">
            {feeValue >= MAX_FEE ? 'Any' : formatCurrency(feeValue)}
          </span>
        </div>
        <Slider
          id="filter-fee"
          min={0}
          max={MAX_FEE}
          step={25}
          value={feeValue}
          onValueChange={(value) =>
            onChange({ maxAnnualFee: value >= MAX_FEE ? undefined : value })
          }
          aria-label="Maximum annual fee"
        />
      </div>

      <Checkbox
        id="filter-no-fee"
        label="No annual fee only"
        checked={Boolean(filters.noAnnualFee)}
        onChange={(e) => onChange({ noAnnualFee: e.target.checked })}
      />
    </div>
  );
}
