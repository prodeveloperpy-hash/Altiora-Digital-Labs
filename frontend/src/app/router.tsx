import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { RouteError } from '@/components/feedback/RouteError';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ROUTES } from '@/config/constants';

// Route-level code splitting: each page is a separate chunk.
const HomePage = lazy(() => import('@/pages/HomePage'));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const CardDetailsPage = lazy(() => import('@/pages/CardDetailsPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Admin pages (separate chunks; only loaded when the admin area is visited).
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const CardsListPage = lazy(() => import('@/pages/admin/CardsListPage'));
const CardFormPage = lazy(() => import('@/pages/admin/CardFormPage'));
const BanksListPage = lazy(() => import('@/pages/admin/BanksListPage'));
const BankFormPage = lazy(() => import('@/pages/admin/BankFormPage'));
const QuestionsListPage = lazy(() => import('@/pages/admin/QuestionsListPage'));
const QuestionFormPage = lazy(() => import('@/pages/admin/QuestionFormPage'));
const CategoriesListPage = lazy(() => import('@/pages/admin/CategoriesListPage'));
const CategoryFormPage = lazy(() => import('@/pages/admin/CategoryFormPage'));
const RulesListPage = lazy(() => import('@/pages/admin/RulesListPage'));
const RuleFormPage = lazy(() => import('@/pages/admin/RuleFormPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'questionnaire', element: <Navigate to="/#recommendation-questionnaire" replace /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'cards/:id', element: <CardDetailsPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Standalone admin login (no admin shell, no auth guard).
  { path: 'admin/login', element: <LoginPage />, errorElement: <RouteError /> },

  // Protected admin area with the admin shell.
  {
    path: 'admin',
    element: <ProtectedRoute />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'cards', element: <CardsListPage /> },
          { path: 'cards/new', element: <CardFormPage /> },
          { path: 'cards/:id/edit', element: <CardFormPage /> },
          { path: 'banks', element: <BanksListPage /> },
          { path: 'banks/new', element: <BankFormPage /> },
          { path: 'banks/:id/edit', element: <BankFormPage /> },
          { path: 'questions', element: <QuestionsListPage /> },
          { path: 'questions/new', element: <QuestionFormPage /> },
          { path: 'questions/:id/edit', element: <QuestionFormPage /> },
          { path: 'categories', element: <CategoriesListPage /> },
          { path: 'categories/new', element: <CategoryFormPage /> },
          { path: 'categories/:id/edit', element: <CategoryFormPage /> },
          { path: 'recommendation-rules', element: <RulesListPage /> },
          { path: 'recommendation-rules/new', element: <RuleFormPage /> },
          { path: 'recommendation-rules/:id/edit', element: <RuleFormPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
