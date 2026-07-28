'use client';

// `useAttempt` — orchestrate the Test Player attempt lifecycle
// (Req 9.1, 9.3, 9.4, 9.5, 10.1, 10.3, 10.4, 11.3, 12.4, 15.1, 15.5).
//
// The hook authenticates via `useAccessToken` and calls the attempt endpoints
// through the shared `httpRequest`, exposing start/startSection/pause/resume/
// submitResponse/submit/retake. The server owns every timing/scoring decision,
// so the hook holds the server-provided `AttemptStateDto` as the single source
// of truth (remaining time, Attempt Status, per-Section state) and renders it
// as-is — there is deliberately no client-side countdown (Req 9.2, 9.3).
//
// Every failure is mapped from the Backend API `HttpError` envelope to a
// UI-consumable `AttemptOutcome` so the Test Player can react without
// inspecting raw status codes:
//   - 401                         -> `auth_required`
//   - 403 + `PAYMENT_REQUIRED`    -> `payment_required`
//   - 404                         -> `not_found`
//   - 422                         -> `invalid`
//   - anything else               -> `error`

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  AttemptResultDto,
  AttemptStateDto,
  SubmitResponseInput,
} from '@/types/testSeries.types';
import { httpRequest } from '@/utils/http';
import type { HttpError, HttpResult } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import {
  API_ROUTES,
  ATTEMPTS_SEGMENT,
  ATTEMPT_PAUSE_SEGMENT,
  ATTEMPT_RESPONSES_SEGMENT,
  ATTEMPT_RESUME_SEGMENT,
  ATTEMPT_SUBMIT_SEGMENT,
  TEST_RETAKE_SEGMENT,
} from './apiClient.constant';
import {
  ATTEMPT_AUTH_REQUIRED_MESSAGE,
  ATTEMPT_AUTH_REQUIRED_STATUS,
  ATTEMPT_JSON_HEADERS,
  ATTEMPT_NOT_FOUND_STATUS,
  ATTEMPT_NO_ACTIVE_ATTEMPT_MESSAGE,
  ATTEMPT_PAYMENT_REQUIRED_CODE,
  ATTEMPT_PAYMENT_REQUIRED_STATUS,
  ATTEMPT_VALIDATION_STATUS,
} from './useAttempt.constant';
import type {
  AttemptOutcome,
  PauseAttemptResponse,
  ResumeAttemptResponse,
  RetakeTestResponse,
  StartSectionAttemptResponse,
  StartTestAttemptResponse,
  SubmitAttemptResponse,
  SubmitResponseResponse,
  UseAttemptResult,
} from './useAttempt.types';
import { useAccessToken } from '../useAccessToken';

/** Build the Authorization + JSON headers for an authenticated attempt call. */
const authHeaders = (accessToken: string): Record<string, string> => ({
  ...ATTEMPT_JSON_HEADERS,
  Authorization: `Bearer ${accessToken}`,
});

/**
 * Classify a Backend API failure into a UI-consumable {@link AttemptOutcome}:
 * 401 → auth_required, 403 `PAYMENT_REQUIRED` → payment_required, 404 →
 * not_found, 422 → invalid, anything else (incl. a non-gate 403, timeout,
 * network, parse) → error.
 */
const classifyOutcome = (error: HttpError): AttemptOutcome => {
  switch (error.status) {
    case ATTEMPT_AUTH_REQUIRED_STATUS:
      return 'auth_required';
    case ATTEMPT_PAYMENT_REQUIRED_STATUS:
      return error.code === ATTEMPT_PAYMENT_REQUIRED_CODE
        ? 'payment_required'
        : 'error';
    case ATTEMPT_NOT_FOUND_STATUS:
      return 'not_found';
    case ATTEMPT_VALIDATION_STATUS:
      return 'invalid';
    default:
      return 'error';
  }
};

export const useAttempt = (): UseAttemptResult => {
  const { token, hasValidToken } = useAccessToken();

  const [state, setState] = useState<AttemptStateDto | null>(null);
  const [result, setResult] = useState<AttemptResultDto | null>(null);

  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isPausing, setIsPausing] = useState<boolean>(false);
  const [isResuming, setIsResuming] = useState<boolean>(false);
  const [isSavingResponse, setIsSavingResponse] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [error, setError] = useState<HttpError | null>(null);
  const [outcome, setOutcome] = useState<AttemptOutcome | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | undefined>(
    undefined,
  );

  // Mirror the latest attempt state into a ref so the lifecycle callbacks
  // (pause/resume/respond/submit) can read the current `attemptId` without being
  // recreated on every state change — the server-provided state stays the
  // single source of truth (Req 9.3).
  const stateRef = useRef<AttemptStateDto | null>(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Shared executor for every attempt request. Short-circuits to
   * `auth_required` when no valid Access Token is held (so no request is made),
   * otherwise toggles the given loading flag, resets the prior error/outcome,
   * performs the request, and maps any failure to an {@link AttemptOutcome}. On
   * success it returns the `ok` result so the caller can store `state`/`result`.
   */
  const execute = useCallback(
    async <T>(
      setLoading: (value: boolean) => void,
      requestFn: (accessToken: string) => Promise<HttpResult<T>>,
    ): Promise<HttpResult<T> | null> => {
      if (!hasValidToken || token === null) {
        setError(null);
        setOutcome('auth_required');
        setFailureMessage(ATTEMPT_AUTH_REQUIRED_MESSAGE);
        return null;
      }

      setLoading(true);
      setError(null);
      setOutcome(null);
      setFailureMessage(undefined);

      const requestResult = await requestFn(token);

      setLoading(false);

      if (!requestResult.ok) {
        setError(requestResult.error);
        setOutcome(classifyOutcome(requestResult.error));
        setFailureMessage(requestResult.error.message);
        return requestResult;
      }

      setOutcome('success');
      return requestResult;
    },
    [hasValidToken, token],
  );

  /**
   * Resolve the current attempt id for a lifecycle action, surfacing a generic
   * `error` outcome when there is no active attempt (nothing to act on).
   */
  const requireAttemptId = useCallback((): string | null => {
    const attemptId = stateRef.current?.attemptId ?? null;
    if (attemptId === null) {
      setError(null);
      setOutcome('error');
      setFailureMessage(ATTEMPT_NO_ACTIVE_ATTEMPT_MESSAGE);
    }
    return attemptId;
  }, []);

  const start = useCallback(
    async (testId: string): Promise<AttemptStateDto | null> => {
      const requestResult = await execute<StartTestAttemptResponse>(
        setIsStarting,
        (accessToken) =>
          httpRequest<StartTestAttemptResponse>(
            buildApiUrl(
              `${API_ROUTES.tests}/${testId}/${ATTEMPTS_SEGMENT}`,
            ),
            { method: 'POST', headers: authHeaders(accessToken) },
          ),
      );
      if (requestResult?.ok) {
        setResult(null);
        setState(requestResult.data.attempt);
        return requestResult.data.attempt;
      }
      return null;
    },
    [execute],
  );

  const startSection = useCallback(
    async (sectionId: string): Promise<AttemptStateDto | null> => {
      const requestResult = await execute<StartSectionAttemptResponse>(
        setIsStarting,
        (accessToken) =>
          httpRequest<StartSectionAttemptResponse>(
            buildApiUrl(
              `${API_ROUTES.sections}/${sectionId}/${ATTEMPTS_SEGMENT}`,
            ),
            { method: 'POST', headers: authHeaders(accessToken) },
          ),
      );
      if (requestResult?.ok) {
        setResult(null);
        setState(requestResult.data.attempt);
        return requestResult.data.attempt;
      }
      return null;
    },
    [execute],
  );

  const pause = useCallback(async (): Promise<AttemptStateDto | null> => {
    const attemptId = requireAttemptId();
    if (attemptId === null) {
      return null;
    }
    const requestResult = await execute<PauseAttemptResponse>(
      setIsPausing,
      (accessToken) =>
        httpRequest<PauseAttemptResponse>(
          buildApiUrl(
            `${API_ROUTES.attempts}/${attemptId}/${ATTEMPT_PAUSE_SEGMENT}`,
          ),
          { method: 'POST', headers: authHeaders(accessToken) },
        ),
    );
    if (requestResult?.ok) {
      setState(requestResult.data.attempt);
      return requestResult.data.attempt;
    }
    return null;
  }, [execute, requireAttemptId]);

  const resume = useCallback(async (): Promise<AttemptStateDto | null> => {
    const attemptId = requireAttemptId();
    if (attemptId === null) {
      return null;
    }
    const requestResult = await execute<ResumeAttemptResponse>(
      setIsResuming,
      (accessToken) =>
        httpRequest<ResumeAttemptResponse>(
          buildApiUrl(
            `${API_ROUTES.attempts}/${attemptId}/${ATTEMPT_RESUME_SEGMENT}`,
          ),
          { method: 'POST', headers: authHeaders(accessToken) },
        ),
    );
    if (requestResult?.ok) {
      setState(requestResult.data.attempt);
      return requestResult.data.attempt;
    }
    return null;
  }, [execute, requireAttemptId]);

  const submitResponse = useCallback(
    async (input: SubmitResponseInput): Promise<AttemptStateDto | null> => {
      const attemptId = requireAttemptId();
      if (attemptId === null) {
        return null;
      }
      const requestResult = await execute<SubmitResponseResponse>(
        setIsSavingResponse,
        (accessToken) =>
          httpRequest<SubmitResponseResponse>(
            buildApiUrl(
              `${API_ROUTES.attempts}/${attemptId}/${ATTEMPT_RESPONSES_SEGMENT}`,
            ),
            {
              method: 'POST',
              headers: authHeaders(accessToken),
              body: JSON.stringify(input),
            },
          ),
      );
      if (requestResult?.ok) {
        setState(requestResult.data.attempt);
        return requestResult.data.attempt;
      }
      return null;
    },
    [execute, requireAttemptId],
  );

  const submit = useCallback(async (): Promise<AttemptResultDto | null> => {
    const attemptId = requireAttemptId();
    if (attemptId === null) {
      return null;
    }
    const requestResult = await execute<SubmitAttemptResponse>(
      setIsSubmitting,
      (accessToken) =>
        httpRequest<SubmitAttemptResponse>(
          buildApiUrl(
            `${API_ROUTES.attempts}/${attemptId}/${ATTEMPT_SUBMIT_SEGMENT}`,
          ),
          { method: 'POST', headers: authHeaders(accessToken) },
        ),
    );
    if (requestResult?.ok) {
      setResult(requestResult.data.result);
      return requestResult.data.result;
    }
    return null;
  }, [execute, requireAttemptId]);

  const retake = useCallback(
    async (testId: string): Promise<AttemptStateDto | null> => {
      const requestResult = await execute<RetakeTestResponse>(
        setIsStarting,
        (accessToken) =>
          httpRequest<RetakeTestResponse>(
            buildApiUrl(
              `${API_ROUTES.tests}/${testId}/${TEST_RETAKE_SEGMENT}`,
            ),
            { method: 'POST', headers: authHeaders(accessToken) },
          ),
      );
      if (requestResult?.ok) {
        setResult(null);
        setState(requestResult.data.attempt);
        return requestResult.data.attempt;
      }
      return null;
    },
    [execute],
  );

  return useMemo<UseAttemptResult>(
    () => ({
      state,
      result,
      start,
      startSection,
      pause,
      resume,
      submitResponse,
      submit,
      retake,
      isStarting,
      isPausing,
      isResuming,
      isSavingResponse,
      isSubmitting,
      error,
      outcome,
      failureMessage,
    }),
    [
      state,
      result,
      start,
      startSection,
      pause,
      resume,
      submitResponse,
      submit,
      retake,
      isStarting,
      isPausing,
      isResuming,
      isSavingResponse,
      isSubmitting,
      error,
      outcome,
      failureMessage,
    ],
  );
};
