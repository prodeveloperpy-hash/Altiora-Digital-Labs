import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#062A6D] text-white shadow-sm hover:bg-[#0B4EA2] active:bg-[#062A6D] dark:bg-[#11B5E4] dark:text-[#071329] dark:hover:bg-[#34C6F3]',
  secondary:
    'bg-[#11B5E4] text-[#062A6D] shadow-sm hover:bg-[#34C6F3]',
  outline:
    'border border-[#062A6D] bg-card text-[#062A6D] hover:border-[#0B4EA2] hover:bg-[#062A6D]/5 dark:border-[#11B5E4] dark:text-[#11B5E4] dark:hover:bg-[#11B5E4]/10',
  ghost: 'bg-transparent text-foreground hover:bg-primary/10 hover:text-primary',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  success: 'bg-success text-success-foreground shadow-sm hover:bg-success/90',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-11 px-5 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-7 text-base gap-2 rounded-lg',
  icon: 'h-10 w-10 rounded-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    fullWidth = false,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-[250ms]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-55',
        variantClasses[variant],
        variant !== 'link' && sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {isLoading ? (loadingText ?? children) : children}
    </button>
  );
});
