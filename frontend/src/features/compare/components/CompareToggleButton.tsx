import { Check, GitCompareArrows } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { useCompare } from '@/features/compare/context/useCompare';
import { useToast } from '@/context/toast/useToast';
import { MAX_COMPARE_CARDS } from '@/config/constants';
import type { CreditCard } from '@/features/cards/types';

interface CompareToggleButtonProps {
  card: CreditCard;
  size?: ButtonProps['size'];
  fullWidth?: boolean;
  className?: string;
}

/** Add/remove a card from the comparison tray, with toast feedback and limits. */
export function CompareToggleButton({
  card,
  size = 'sm',
  fullWidth,
  className,
}: CompareToggleButtonProps) {
  const { isSelected, isFull, toggle } = useCompare();
  const toast = useToast();
  const selected = isSelected(card.id);

  const handleClick = () => {
    if (!selected && isFull) {
      toast.warning(
        'Comparison list is full',
        `You can compare up to ${MAX_COMPARE_CARDS} cards at once. Remove one to add another.`,
      );
      return;
    }
    const nowSelected = toggle(card);
    if (nowSelected) {
      toast.success('Added to comparison', `${card.name} is ready to compare.`);
    } else {
      toast.info('Removed from comparison', `${card.name} was removed.`);
    }
  };

  return (
    <Button
      type="button"
      variant={selected ? 'primary' : 'outline'}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      aria-pressed={selected}
      className={className}
    >
      {selected ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Added
        </>
      ) : (
        <>
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
          Compare
        </>
      )}
    </Button>
  );
}
