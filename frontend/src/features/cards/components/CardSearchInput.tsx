import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/config/constants';

interface CardSearchInputProps {
  value: string;
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
}

/**
 * Search-as-you-type input. Keeps immediate local state for responsiveness and
 * notifies the parent only after the value settles (debounced).
 */
export function CardSearchInput({
  value,
  onDebouncedChange,
  placeholder = 'Search cards by name, issuer, or benefit…',
  autoFocus,
  id,
}: CardSearchInputProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, SEARCH_DEBOUNCE_MS);

  // Push debounced changes upward.
  useEffect(() => {
    onDebouncedChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Keep local state in sync when the source value changes externally (e.g. clear).
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <Input
      id={id}
      type="search"
      role="searchbox"
      value={local}
      autoFocus={autoFocus}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={placeholder}
      aria-label="Search credit cards"
      startAdornment={<Search className="h-4 w-4" aria-hidden="true" />}
      endAdornment={
        local ? (
          <button
            type="button"
            onClick={() => setLocal('')}
            aria-label="Clear search"
            className="pointer-events-auto rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : undefined
      }
    />
  );
}
