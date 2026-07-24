import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format Indian rupee amounts. Whole numbers render without decimals. */
export function formatCurrency(value: number, options: Intl.NumberFormatOptions = {}): string {
  const hasFraction = value % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/** Format a ratio between 0 and 1 (or 0-100) as a percentage string. */
export function formatPercent(value: number, fractionDigits = 0): string {
  const normalized = value > 1 ? value / 100 : value;
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(normalized);
}

/** Render an annual fee, treating 0 as the friendlier "No annual fee". */
export function formatAnnualFee(value: number): string {
  return value <= 0 ? 'No annual fee' : `${formatCurrency(value)}/yr`;
}

/** Format an APR range, e.g. "18.99% – 26.99% variable APR". */
export function formatAprRange(min: number, max: number): string {
  if (min === max) return `${min.toFixed(2)}% APR`;
  return `${min.toFixed(2)}% – ${max.toFixed(2)}% variable APR`;
}

/** Convert an arbitrary string into a URL/DOM-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** Truncate text to a maximum length, appending an ellipsis when clipped. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Convert a machine token (e.g. "balance-transfer") into a Title Case label. */
export function humanize(token: string): string {
  return token
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Stable pluralization helper. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

/** Clamp a number between a lower and upper bound. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
