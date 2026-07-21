import { useEffect } from 'react';
import { APP_NAME } from '@/config/constants';

/**
 * Set the document title for a page, restoring the previous title on unmount.
 * Pass a page-specific title; the app name is appended automatically.
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} — Smarter Credit Card Recommendations`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
