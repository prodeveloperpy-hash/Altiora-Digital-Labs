import { useCallback, useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '@/config/constants';
import type { QuestionnaireAnswers } from '@/features/questionnaire/types';

/**
 * Persists questionnaire answers in sessionStorage so the recommendations page
 * can read them after navigation and a refresh does not lose the user's input.
 * Implemented as an external store so multiple components stay in sync.
 */

const listeners = new Set<() => void>();
let cache: QuestionnaireAnswers | null | undefined;

function read(): QuestionnaireAnswers | null {
  if (cache !== undefined) return cache;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.questionnaire);
    cache = raw ? (JSON.parse(raw) as QuestionnaireAnswers) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useQuestionnaireStore() {
  const answers = useSyncExternalStore(subscribe, read, () => null);

  const saveAnswers = useCallback((next: QuestionnaireAnswers) => {
    try {
      window.sessionStorage.setItem(STORAGE_KEYS.questionnaire, JSON.stringify(next));
    } catch {
      /* ignore persistence failures */
    }
    cache = next;
    emit();
  }, []);

  const clearAnswers = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEYS.questionnaire);
    } catch {
      /* ignore */
    }
    cache = null;
    emit();
  }, []);

  return { answers, saveAnswers, clearAnswers };
}
