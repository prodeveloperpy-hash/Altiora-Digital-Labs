import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '@/features/recommendations/api/recommendationsApi';
import { queryKeys } from '@/lib/queryKeys';
import type { QuestionnaireAnswers } from '@/features/questionnaire/types';

/**
 * Fetches recommendations for a set of questionnaire answers. Disabled until
 * answers are available (e.g. the user has completed the questionnaire).
 */
export function useRecommendations(answers: QuestionnaireAnswers | null) {
  return useQuery({
    queryKey: answers ? queryKeys.recommendations.forAnswers(answers) : queryKeys.recommendations.all,
    queryFn: ({ signal }) => recommendationsApi.getRecommendations(answers as QuestionnaireAnswers, signal),
    enabled: Boolean(answers),
    staleTime: 2 * 60_000,
  });
}
