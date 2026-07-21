/** Domain types for the admin panel (mirrors the backend admin API contract). */

import type { CreditCard } from '@/features/cards/types';

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AdminUser;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// --- Dashboard -----------------------------------------------------------
export interface DashboardStats {
  totalCards: number;
  activeCards: number;
  totalBanks: number;
  totalQuestions: number;
  totalCategories: number;
  totalRules: number;
  activeRules: number;
}

export interface ActivityEntry {
  id: number;
  actor: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  createdAt: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentActivity: ActivityEntry[];
}

// --- Cards ---------------------------------------------------------------
export interface AdminCard extends CreditCard {
  isFeatured: boolean;
  isActive: boolean;
  bankId?: string | null;
  createdAt: string;
}

export interface CardWritePayload {
  slug: string;
  name: string;
  issuer: string;
  network: string;
  bankId?: string | null;
  categories: string[];
  imageUrl: string;
  summary: string;
  description: string;
  annualFee: number;
  aprMin: number;
  aprMax: number;
  introApr?: string | null;
  introAprMonths?: number | null;
  foreignTransactionFee: number;
  recommendedCreditScore: string;
  rewardsSummary: string;
  rewardRates: { category: string; rate: number; unit: string; cap?: string | null }[];
  signupBonus?: string | null;
  signupBonusValue?: number | null;
  rewardsCurrency?: string | null;
  benefits: string[];
  pros: string[];
  cons: string[];
  rating: number;
  reviewCount: number;
  applyUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

// --- Banks ---------------------------------------------------------------
export interface Bank {
  id: string;
  slug: string;
  name: string;
  country: string;
  website: string;
  description: string;
  isActive: boolean;
  cardCount: number;
  updatedAt: string;
}

export interface BankWritePayload {
  slug: string;
  name: string;
  country: string;
  website: string;
  description: string;
  isActive: boolean;
}

// --- Categories ----------------------------------------------------------
export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  cardCount: number;
}

// --- Questions -----------------------------------------------------------
export type QuestionType = 'radio' | 'checkbox' | 'dropdown' | 'number' | 'slider';

export interface CardCondition {
  field: string;
  operator: string;
  value: string | number;
}

export interface QuestionOption {
  id?: string;
  label: string;
  value: string;
  weight: number;
  position?: number;
  mappedCategories: string[];
  mappedRules: string[];
  mappedCardConditions: CardCondition[];
}

export interface Question {
  id: string;
  key: string;
  label: string;
  helpText: string;
  type: QuestionType;
  isRequired: boolean;
  isActive: boolean;
  position: number;
  config: Record<string, unknown>;
  options: Required<QuestionOption>[];
  updatedAt: string;
}

export interface QuestionWritePayload {
  key: string;
  label: string;
  helpText: string;
  type: QuestionType;
  isRequired: boolean;
  isActive: boolean;
  config: Record<string, unknown>;
  options: QuestionOption[];
}

// --- Recommendation rules ------------------------------------------------
export type RuleOutcome = 'pro' | 'con' | 'neutral';

export interface RecommendationRule {
  id: number;
  code: string;
  description: string;
  operator: string;
  answerField?: string | null;
  cardField?: string | null;
  targetNumber?: number | null;
  targetValue?: string | null;
  points: number;
  weightKey?: string | null;
  benefitCode?: string | null;
  reasonLabel: string;
  reasonDetail: string;
  outcome: RuleOutcome;
  isActive: boolean;
  priority: number;
  updatedAt: string;
}

export interface RuleWritePayload {
  code: string;
  description: string;
  operator: string;
  answerField?: string | null;
  cardField?: string | null;
  targetNumber?: number | null;
  targetValue?: string | null;
  points: number;
  weightKey?: string | null;
  benefitCode?: string | null;
  reasonLabel: string;
  reasonDetail: string;
  outcome: RuleOutcome;
  isActive: boolean;
  priority: number;
}

export interface OperatorCatalog {
  scoring: string[];
  eligibility: string[];
  cardFields: string[];
  weightKeys: string[];
}

// --- Settings ------------------------------------------------------------
export interface Setting {
  key: string;
  value: unknown;
  label: string;
  description: string;
  valueType: 'text' | 'number' | 'select' | 'json' | 'color';
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  contentType: string;
}
