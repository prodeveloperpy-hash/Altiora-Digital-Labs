import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, id, ...props },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-w-0 cursor-pointer items-start gap-2.5 text-sm leading-5',
        className,
      )}
    >
      <span className="relative mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-input bg-card transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
          {...props}
        />
        <Check
          className="pointer-events-none absolute h-3.5 w-3.5 scale-0 text-primary-foreground transition-transform peer-checked:scale-100"
          aria-hidden="true"
        />
      </span>
      {label && <span className="min-w-0 break-words text-foreground">{label}</span>}
    </label>
  );
});
