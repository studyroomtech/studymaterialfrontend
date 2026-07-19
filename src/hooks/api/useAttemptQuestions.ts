'use client';

// `useAttemptQuestions` — load the in-scope Question content for an open
// attempt from `GET /api/attempts/:id/questions` (Req 9.4).
//
// The attempt state endpoints return timing/status only; this hook fetches the
// Questions (text + Option text, never correctness) so the Test Player can
// render them while the attempt is in progress. The endpoint is behind auth and
// owner-scoped, so the learner Access Token from `useAccessToken` is sent as an
// `Authorization: Bearer <token>` header (the Backend resolves the owning User
// Record and 404s any attempt that is not the caller's). On failure the hook
// exposes an empty Questions list plus a typed error so the caller can render
// the failure without any partial or stale content.

import { useCallback, useState } from 'react';

import type { AttemptQuestionDto } from '@/types/testSeries.types';
import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES, ATTEMPT_QUESTIONS_SEGMENT } from './apiClient.constant';
import type {
  AttemptQuestionsResponse,
  UseAttemptQuestionsResult,
} from './useAttemptQuestions.types';
import { useAccessToken } from '../useAccessToken';

export const useAttemptQuestions = (): UseAttemptQuestionsResult => {
  // Behind auth: the Backend resolves the owning Learner from this token.
  const { token } = useAccessToken();

  const [questions, setQuestions] = useState<AttemptQuestionDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<HttpError | null>(null);

  // Load the in-scope Questions for an attempt by id (Req 9.4). Resolves with
  // the Questions on success, or `null` on failure (inspect `error`).
  const loadQuestions = useCallback(
    async (attemptId: string): Promise<AttemptQuestionDto[] | null> => {
      setIsLoading(true);
      setError(null);

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token !== null && token.length > 0) {
        headers.Authorization = `Bearer ${token}`;
      }

      const result = await httpRequest<AttemptQuestionsResponse>(
        buildApiUrl(
          `${API_ROUTES.attempts}/${attemptId}/${ATTEMPT_QUESTIONS_SEGMENT}`,
        ),
        { headers },
      );

      setIsLoading(false);

      if (result.ok) {
        setQuestions(result.data.questions.questions);
        return result.data.questions.questions;
      }

      // Surface the failure and drop any previously loaded Questions so no stale
      // content is shown for a request that failed.
      setQuestions([]);
      setError(result.error);
      return null;
    },
    [token],
  );

  return { questions, isLoading, error, loadQuestions };
};
