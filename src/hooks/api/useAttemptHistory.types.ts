// Type declarations for the `useAttemptHistory` API-call hook (Req 14.1, 14.2,
// 14.5). All type/interface declarations live here so the hook module stays
// free of type declarations (matching the `.types.ts` / `.ts` convention used
// across `hooks/api/`).
//
// The hook loads the signed-in Learner's completed-attempt history from
// `GET /api/attempts` and, on demand, one owner-scoped attempt review from
// `GET /api/attempts/:id`. The DTO shapes are reused from the shared client-side
// contract in `@/types/testSeries.types` so the client is strictly typed
// against the server responses.

import type {
  AttemptHistoryItemDto,
  AttemptReviewDto,
} from '@/types/testSeries.types';
import type { HttpError } from '@/utils/http.types';

/**
 * Response body of `GET /api/attempts`: the caller's completed Test Attempts,
 * most recently completed first (Req 14.1). An empty `attempts` array signals
 * "no completed attempts" for the consumer to render an empty-state (Req 14.5).
 */
export interface AttemptHistoryResponse {
  attempts: AttemptHistoryItemDto[];
}

/**
 * Response body of `GET /api/attempts/:id`: one owner-scoped completed attempt
 * with its full review graph — each Question, its Options, the Correct Option
 * Set, and the Learner's recorded Response (Req 14.2).
 */
export interface AttemptReviewResponse {
  review: AttemptReviewDto;
}

/**
 * Value returned by {@link useAttemptHistory} for the history and review
 * surfaces (Req 14.1, 14.2, 14.5):
 *   - `attempts`         the caller's completed Test Attempts in the
 *                        server-provided order — empty on failure so no partial
 *                        or stale history is surfaced (Req 14.1).
 *   - `isHistoryLoading` `true` while the history request is in flight (Req 7.3).
 *   - `historyError`     the typed failure of the most recent history request,
 *                        or `null` when the last request succeeded.
 *   - `isHistoryEmpty`   `true` on a successful, non-loading, error-free load
 *                        with no completed attempts, driving the empty-state
 *                        message (Req 14.5).
 *   - `review`           the most recently loaded attempt review, or `null`
 *                        before one has been requested / on failure.
 *   - `isReviewLoading`  `true` while a single-review request is in flight.
 *   - `reviewError`      the typed failure of the most recent review request,
 *                        or `null` when the last request succeeded.
 *   - `loadReview`       load one owner-scoped attempt review by id; resolves
 *                        with the review, or `null` on failure (Req 14.2).
 */
export interface UseAttemptHistoryResult {
  attempts: AttemptHistoryItemDto[];
  isHistoryLoading: boolean;
  historyError: HttpError | null;
  isHistoryEmpty: boolean;

  review: AttemptReviewDto | null;
  isReviewLoading: boolean;
  reviewError: HttpError | null;
  loadReview: (attemptId: string) => Promise<AttemptReviewDto | null>;
}
