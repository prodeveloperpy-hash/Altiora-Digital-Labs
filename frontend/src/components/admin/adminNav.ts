import {
  CreditCard,
  LayoutDashboard,
  Landmark,
  ListChecks,
  Tags,
  SlidersHorizontal,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Path prefix used to determine the active state (covers nested new/edit routes). */
  match: string;
}

/** Primary admin navigation — single source of truth for the sidebar. */
export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', to: ADMIN_ROUTES.dashboard, icon: LayoutDashboard, match: ADMIN_ROUTES.dashboard },
  { label: 'Cards', to: ADMIN_ROUTES.cards, icon: CreditCard, match: ADMIN_ROUTES.cards },
  { label: 'Banks', to: ADMIN_ROUTES.banks, icon: Landmark, match: ADMIN_ROUTES.banks },
  { label: 'Questions', to: ADMIN_ROUTES.questions, icon: ListChecks, match: ADMIN_ROUTES.questions },
  { label: 'Categories', to: ADMIN_ROUTES.categories, icon: Tags, match: ADMIN_ROUTES.categories },
  {
    label: 'Recommendation Rules',
    to: ADMIN_ROUTES.rules,
    icon: SlidersHorizontal,
    match: ADMIN_ROUTES.rules,
  },
  { label: 'Settings', to: ADMIN_ROUTES.settings, icon: Settings, match: ADMIN_ROUTES.settings },
];
