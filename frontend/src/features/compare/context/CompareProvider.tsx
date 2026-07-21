import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MAX_COMPARE_CARDS, STORAGE_KEYS } from '@/config/constants';
import type { CreditCard } from '@/features/cards/types';
import { CompareContext, type CompareItem } from './CompareContext';

function loadInitial(): CompareItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.compare);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is CompareItem => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof (item as CompareItem).id === 'string' &&
          typeof (item as CompareItem).name === 'string'
        );
      })
      .slice(0, MAX_COMPARE_CARDS);
  } catch {
    return [];
  }
}

function toCompareItem(card: CreditCard): CompareItem {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    issuer: card.issuer,
    imageUrl: card.imageUrl,
  };
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.compare, JSON.stringify(items));
    } catch {
      /* ignore persistence failures */
    }
  }, [items]);

  const isSelected = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const add = useCallback(
    (card: CreditCard): boolean => {
      let added = false;
      setItems((prev) => {
        if (prev.some((i) => i.id === card.id) || prev.length >= MAX_COMPARE_CARDS) {
          return prev;
        }
        added = true;
        return [...prev, toCompareItem(card)];
      });
      return added;
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggle = useCallback((card: CreditCard): boolean => {
    let selected = false;
    setItems((prev) => {
      if (prev.some((i) => i.id === card.id)) {
        selected = false;
        return prev.filter((i) => i.id !== card.id);
      }
      if (prev.length >= MAX_COMPARE_CARDS) {
        selected = true; // already present conceptually full; keep existing selection
        return prev;
      }
      selected = true;
      return [...prev, toCompareItem(card)];
    });
    return selected;
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ids: items.map((i) => i.id),
      count: items.length,
      isFull: items.length >= MAX_COMPARE_CARDS,
      isSelected,
      add,
      remove,
      toggle,
      clear,
    }),
    [items, isSelected, add, remove, toggle, clear],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
