import { env } from './env';

/** Application-wide constants and route path definitions. */

export const APP_NAME = env.appName;
export const APP_TAGLINE = 'Smarter credit card recommendations, tailored to you.';

/** Maximum number of cards a user may place side-by-side in the comparison tray. */
export const MAX_COMPARE_CARDS = 4;

/** Default page size for paginated card listings. */
export const DEFAULT_PAGE_SIZE = 12;

/** Debounce delay (ms) applied to search-as-you-type inputs. */
export const SEARCH_DEBOUNCE_MS = 350;

/** localStorage keys. */
export const STORAGE_KEYS = {
  theme: 'cardwise-theme',
  compare: 'cardwise-compare',
  questionnaire: 'cardwise-questionnaire-answers',
} as const;

/** Centralized route paths — the single source of truth for navigation. */
export const ROUTES = {
  home: '/',
  questionnaire: '/questionnaire',
  recommendations: '/recommendations',
  cards: '/cards',
  cardDetails: (id: string = ':id') => `/cards/${id}`,
  search: '/search',
  compare: '/compare',
  about: '/about',
  faq: '/faq',
  notFound: '*',
} as const;
