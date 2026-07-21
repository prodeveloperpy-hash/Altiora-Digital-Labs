import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top on every pathname change so navigating between
 * routes always starts at the top of the page (unless the user prefers reduced
 * motion, in which case the jump is instant).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}
