import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { PageLoader } from '@/components/feedback/PageLoader';
import { CompareTray } from '@/features/compare/components/CompareTray';

/** App shell: persistent navigation, routed page content, footer, and overlays. */
export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CompareTray />
      {/* Spacer so the fixed compare tray never covers footer content on short pages. */}
      <div aria-hidden="true" className="h-2" />
    </div>
  );
}
