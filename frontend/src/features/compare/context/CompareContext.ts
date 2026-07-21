import { createContext } from 'react';
import type { CreditCard } from '@/features/cards/types';

/** A lightweight snapshot of a card kept in the comparison tray. */
export interface CompareItem {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  imageUrl: string;
}

export interface CompareContextValue {
  items: CompareItem[];
  ids: string[];
  count: number;
  isFull: boolean;
  isSelected: (id: string) => boolean;
  /** Add a card. Returns false if the tray is full or the card is already present. */
  add: (card: CreditCard) => boolean;
  remove: (id: string) => void;
  /** Add if absent, remove if present. Returns the resulting selection state. */
  toggle: (card: CreditCard) => boolean;
  clear: () => void;
}

export const CompareContext = createContext<CompareContextValue | undefined>(undefined);
