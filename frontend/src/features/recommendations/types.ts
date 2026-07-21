import type { CreditCard } from '@/features/cards/types';

/** A single reason contributing to a card's match against the user's answers. */
export interface MatchReason {
  label: string;
  detail: string;
}

/** A recommended card paired with its computed match metadata. */
export interface Recommendation {
  card: CreditCard;
  /** Match score from 0-100, computed by the backend's database-driven rules. */
  matchScore: number;
  /** Human-readable reasons the card was recommended. */
  reasons: MatchReason[];
  /** Optional rank badge, e.g. "Best overall". */
  highlight?: string;
}

/** Full response from the recommendations endpoint. */
export interface RecommendationResult {
  recommendations: Recommendation[];
  /** Total number of cards evaluated by the rules engine. */
  evaluatedCount: number;
}
