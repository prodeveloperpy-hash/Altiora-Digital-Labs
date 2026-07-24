/** Domain types for credit cards. */

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'discover';

export type CreditScoreTier = 'excellent' | 'good' | 'fair' | 'poor' | 'building';

export type CardCategory =
  | 'cashback'
  | 'travel'
  | 'rewards'
  | 'balance-transfer'
  | 'low-interest'
  | 'student'
  | 'business'
  | 'secured'
  | 'no-annual-fee';

/** A single earn rate, e.g. "3% on dining". */
export interface RewardRate {
  category: string;
  rate: number; // percentage, e.g. 3 for 3%
  unit: 'percent' | 'points' | 'miles';
  cap?: string;
}

/** Core credit card entity returned by the backend. */
export interface CreditCard {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  network: CardNetwork;
  categories: CardCategory[];
  imageUrl: string;
  /** Short marketing summary. */
  summary: string;
  /** Long-form description shown on the details page. */
  description: string;
  annualFee: number;
  cardType: string;
  joiningFee: number;
  feeWaiver: string;
  eligibility: string;
  incomeRequirement: string;
  rewardRate: string;
  rewardPoints: string;
  cashbackCategories: string;
  loungeDomestic: string;
  loungeInternational: string;
  insurance: string;
  fuel: string;
  dining: string;
  shopping: string;
  travel: string;
  forex: string;
  upi: string;
  concierge: string;
  golf: string;
  welcomeBonus: string;
  renewalBenefits: string;
  addOnCards: string;
  emiConversion: string;
  balanceTransfer: string;
  merchantOffers: string;
  aprMin: number;
  aprMax: number;
  introApr?: string;
  introAprMonths?: number;
  foreignTransactionFee: number;
  recommendedCreditScore: CreditScoreTier;
  rewardsSummary: string;
  rewardRates: RewardRate[];
  signupBonus?: string;
  signupBonusValue?: number;
  rewardsCurrency?: string;
  benefits: string[];
  pros: string[];
  cons: string[];
  rating: number; // 0-5
  reviewCount: number;
  applyUrl: string;
  updatedAt: string; // ISO date
}

/** Category metadata used for filters and home-page browsing. */
export interface Category {
  id: string;
  slug: CardCategory;
  name: string;
  description: string;
  cardCount: number;
}

export type CardSortField = 'recommended' | 'annualFee' | 'apr' | 'rating' | 'name';

/** Query parameters accepted by the card list / search endpoint. */
export interface CardListParams {
  search?: string;
  category?: CardCategory;
  network?: CardNetwork;
  creditScore?: CreditScoreTier;
  maxAnnualFee?: number;
  noAnnualFee?: boolean;
  bank?: string;
  fee?: string;
  benefits?: string[];
  sort?: CardSortField;
  direction?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface FilterOption { code: string; name: string }
export interface BenefitOption extends FilterOption { description?: string }
export interface FilterCatalog {
  banks: Array<{ slug: string; name: string }>;
  fees: FilterOption[];
  benefits: BenefitOption[];
}
export interface QuestionnaireCategory { name: string; benefits: BenefitOption[] }
export interface QuestionnaireCatalog { categories: QuestionnaireCategory[] }
