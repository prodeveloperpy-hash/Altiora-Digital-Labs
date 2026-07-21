import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types/api';

interface BaseProps<T extends string> {
  options: SelectOption<T>[];
  /** Optional accessible label describing the group. */
  ariaLabel?: string;
  className?: string;
  columns?: 1 | 2 | 3;
}

interface SingleProps<T extends string> extends BaseProps<T> {
  multiple?: false;
  value: T | undefined;
  onChange: (value: T) => void;
}

interface MultiProps<T extends string> extends BaseProps<T> {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
}

type OptionCardsProps<T extends string> = SingleProps<T> | MultiProps<T>;

const columnClass: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

/**
 * A keyboard- and screen-reader-accessible tile selector. Renders a radio group
 * for single-select and a checkbox group for multi-select. Designed to be driven
 * by a React Hook Form Controller.
 */
export function OptionCards<T extends string>(props: OptionCardsProps<T>) {
  const { options, ariaLabel, className, columns = 2 } = props;

  const isChecked = (optionValue: T): boolean =>
    props.multiple ? props.value.includes(optionValue) : props.value === optionValue;

  const handleSelect = (optionValue: T) => {
    if (props.multiple) {
      const set = new Set(props.value);
      if (set.has(optionValue)) set.delete(optionValue);
      else set.add(optionValue);
      props.onChange(Array.from(set));
    } else {
      props.onChange(optionValue);
    }
  };

  return (
    <div
      role={props.multiple ? 'group' : 'radiogroup'}
      aria-label={ariaLabel}
      className={cn('grid gap-3', columnClass[columns], className)}
    >
      {options.map((option) => {
        const checked = isChecked(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role={props.multiple ? 'checkbox' : 'radio'}
            aria-checked={checked}
            onClick={() => handleSelect(option.value)}
            className={cn(
              'group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              checked
                ? 'border-primary bg-primary/5 shadow-glow'
                : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-colors',
                checked
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-card',
              )}
              aria-hidden="true"
            >
              {checked && <Check className="h-3.5 w-3.5" />}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">{option.label}</span>
              {option.description && (
                <span className="text-xs text-muted-foreground">{option.description}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
