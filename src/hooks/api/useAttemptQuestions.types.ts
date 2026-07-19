// Type declarations for the `useAttemptQuestions` API-call hook (Req 9.4). All
// type/interface declarations live here so the hook module stays free of type
// declarations (matching the `.types.ts` / `.ts` convention used across
// `hooks/api/`).
//
// The hook loads the in-scope Question content for an open attempt from
// `GET /api/attempts/:id/questions` so the Test Player can render the Questions
// while the attempt is in progress. The DTO shapes are reused from the shared
// client-side contract in `@/types/testSeries.types` so the client is strictly
// typed against the server response.

import type {
  AttemptQuestionDto,
  AttemptQuestionsDto,
} from '@/types/testSeries.types';
import type { HttpError } from '@/utils/http.types';

/**
 * Response body of `GET /api/attempts/:id/questions`: the attempt id and its
 * in-scope Questions with Option text only (never correctness) plus the
 * Learner's current selection per Question (Req 9.4).
 */
export interface AttemptQuestionsResponse {
  questions: AttemptQuestionsDto;
}

/**
 * Value returned by {@link useAttemptQuestions} for the Test Player (Req 9.4):
 *   - `questions`   the in-scope Questions in the server-provided order — empty
 *                   on failure so no partial or stale content is surfaced.
 *   - `isLoading`   `true` while the questions request is in flight.
 *   - `error`       the typed failure of the most recent request, or `null` when
 *                   the last request succeeded.
 *   - `loadQuestions` load the in-scope Questions for an attempt by id; resolves
 *                   with the Questions, or `null` on failure.
 */
export interface UseAttemptQuestionsResult {
  questions: AttemptQuestionDto[];
  isLoading: boolean;
  error: HttpError | null;
  loadQuestions: (attemptId: string) => Promise<AttemptQuestionDto[] | null>;
}
