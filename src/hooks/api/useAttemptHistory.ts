'use client';

// `useAttemptHistory` — load the signed-in Learner's completed-attempt history
// and, on demand, a single owner-scoped attempt review (Req 14.1, 14.2, 14.5).
//
// Both endpoints are behind auth, so the learner Access Token from
// `useAccessToken` is sent as an `Authorization: Bearer <token>` header (the
// Backend resolves the owning User Record from it and 404s any attempt that is
// not the caller's).
//
//   - The history list (`GET /api/attempts`) is fetched through the shared
//     `useApiResource`, exposing `{ attempts, isHistoryLoading, historyError }`.
//     On failure the list is empty so no partial or stale history is surfaced;
//     an error-free, non-loading empty load drives the empty-state (Req 14.5).
//   - `loadReview(attemptId)` fetches one review (`GET /api/attempts/:id`) via
//     the shared `httpRequest`, holding it alongside its own loading/error state
//     so the review page can render feedback independently of the list.

import { useCallback, useState } from 'react';

import type { AttemptReviewDto } from '@/types/testSeries.types';
import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import type {
  AttemptHistoryResponse,
  AttemptReviewResponse,
  UseAttemptHistoryResult,
} from './useAttemptHistory.types';
import { useApiResource } from './useApiResource';
import { useAccessToken } from '../useAccessToken';

export const useAttemptHistory = (): UseAttemptHistoryResult => {
  // Behind auth: the Backend resolves the owning Learner from this token.
  const { token } = useAccessToken();

  const {
    data,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useApiResource<AttemptHistoryResponse>(buildApiUrl(API_ROUTES.attempts), {
    authToken: token,
  });

  // On failure, surface no partial or stale history: expose an empty list and
  // let the consumer render the error. Otherwise pass the server-provided
  // entries through untouched, preserving their order (Req 14.1).
  const attempts = historyError !== null ? [] : (data?.attempts ?? []);

  // An error-free, settled load with no completed attempts drives the
  // empty-state message (Req 14.5).
  const isHistoryEmpty =
    historyError === null && !isHistoryLoading && attempts.length === 0;

  const [review, setReview] = useState<AttemptReviewDto | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<HttpError | null>(null);

  // Load one owner-scoped attempt review by id (Req 14.2). Resolves with the
  // review on success, or `null` on failure (inspect `reviewError`).
  const loadReview = useCallback(
    async (attemptId: string): Promise<AttemptReviewDto | null> => {
      setIsReviewLoading(true);
      setReviewError(null);

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token !== null && token.length > 0) {
        headers.Authorization = `Bearer ${token}`;
      }

      const result = await httpRequest<AttemptReviewResponse>(
        buildApiUrl(`${API_ROUTES.attempts}/${attemptId}`),
        { headers },
      );

      setIsReviewLoading(false);

      if (result.ok) {
        setReview(result.data.review);
        return result.data.review;
      }

      // Surface the failure and drop any previously loaded review so no stale
      // review is shown for a request that failed (e.g. a 404 for an attempt
      // that is not the caller's).
      setReview(null);
      setReviewError(result.error);
      return null;
    },
    [token],
  );

  return {
    attempts,
    isHistoryLoading,
    historyError,
    isHistoryEmpty,
    review,
    isReviewLoading,
    reviewError,
    loadReview,
  };
};
