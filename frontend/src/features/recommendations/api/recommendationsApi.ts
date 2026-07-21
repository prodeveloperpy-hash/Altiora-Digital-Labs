import { apiClient } from '@/lib/apiClient';
import type { QuestionnaireAnswers } from '@/features/questionnaire/types';
import type { RecommendationResult } from '@/features/recommendations/types';

/**
 * Recommendations API. The backend evaluates the submitted answers against its
 * database-driven rules engine and returns ranked, scored matches.
 *   POST /recommendations  body: QuestionnaireAnswers → RecommendationResult
 */
export const recommendationsApi = {
  getRecommendations(
    answers: QuestionnaireAnswers,
    signal?: AbortSignal,
  ): Promise<RecommendationResult> {
    return apiClient.post<RecommendationResult, QuestionnaireAnswers>(
      '/recommendations',
      answers,
      { signal },
    );
  },
};
