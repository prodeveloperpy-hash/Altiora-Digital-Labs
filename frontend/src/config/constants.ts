import { env } from './env';

/** Application-wide constants and route path definitions. */

export const APP_NAME = env.appName;
export const APP_TAGLINE = 'Smarter credit card recommendations, tailored to you.';

/** Maximum number of cards a user may place side-by-side in the comparison tray. */
export const MAX_COMPARE_CARDS = 2;

/** Default page size for paginated card listings. */
export const DEFAULT_PAGE_SIZE = 12;

/** Debounce delay (ms) applied to search-as-you-type inputs. */
export const SEARCH_DEBOUNCE_MS = 350;

/** localStorage keys. */
export const STORAGE_KEYS = {
  theme: 'cardwise-theme',
  compare: 'cardwise-compare',
  questionnaire: 'cardwise-questionnaire-answers',
  recommendationBenefits: 'cardwise-recommendation-benefits',
  adminAccessToken: 'cardwise-admin-access-token',
  adminRefreshToken: 'cardwise-admin-refresh-token',
  adminUser: 'cardwise-admin-user',
  adminRemember: 'cardwise-admin-remember',
} as const;

/** Centralized route paths — the single source of truth for navigation. */
export const ROUTES = {
  home: '/',
  questionnaire: '/#recommendation-questionnaire',
  recommendations: '/recommendations',
  cards: '/cards',
  cardDetails: (id: string = ':id') => `/cards/${id}`,
  search: '/search',
  compare: '/compare',
  about: '/about',
  faq: '/faq',
  contact: '/contact',
  notFound: '*',
} as const;

/** Admin panel route paths — the single source of truth for admin navigation. */
export const ADMIN_ROUTES = {
  root: '/admin',
  login: '/admin/login',
  dashboard: '/admin/dashboard',
  cards: '/admin/cards',
  cardNew: '/admin/cards/new',
  cardEdit: (id: string = ':id') => `/admin/cards/${id}/edit`,
  banks: '/admin/banks',
  bankNew: '/admin/banks/new',
  bankEdit: (id: string = ':id') => `/admin/banks/${id}/edit`,
  questions: '/admin/questions',
  questionNew: '/admin/questions/new',
  questionEdit: (id: string = ':id') => `/admin/questions/${id}/edit`,
  categories: '/admin/categories',
  categoryNew: '/admin/categories/new',
  categoryEdit: (id: string = ':id') => `/admin/categories/${id}/edit`,
  rules: '/admin/recommendation-rules',
  ruleNew: '/admin/recommendation-rules/new',
  ruleEdit: (id: string = ':id') => `/admin/recommendation-rules/${id}/edit`,
  settings: '/admin/settings',
} as const;
