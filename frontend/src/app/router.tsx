import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { RouteError } from '@/components/feedback/RouteError';
import { ROUTES } from '@/config/constants';

// Route-level code splitting: each page is a separate chunk.
const HomePage = lazy(() => import('@/pages/HomePage'));
const QuestionnairePage = lazy(() => import('@/pages/QuestionnairePage'));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const CardDetailsPage = lazy(() => import('@/pages/CardDetailsPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'questionnaire', element: <QuestionnairePage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'cards/:id', element: <CardDetailsPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
