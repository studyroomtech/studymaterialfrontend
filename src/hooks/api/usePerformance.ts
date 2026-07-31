'use client';

// `usePerformance` — load the signed-in Learner's performance across every
// completed attempt (`GET /api/attempts/performance`).
//
// The endpoint is behind auth, so the learner Access Token from
// `useAccessToken` is sent as an `Authorization: Bearer <token>` header; the
// Backend resolves the owning User Record from it and reports on that Learner's
// attempts only.
//
// Every figure is derived server-side from stored Responses, Section marking,
// and banked active time, so there is nothing to compute or cache here. On
// failure the report is dropped rather than partially rendered, and a settled,
// error-free load with no completed attempts drives the empty-state.

import { buildApiUrl } from './apiClient';
import { API_ROUTES, ATTEMPTS_PERFORMANCE_SEGMENT } from './apiClient.constant';
import type {
  PerformanceResponse,
  UsePerformanceResult,
} from './usePerformance.types';
import { useApiResource } from './useApiResource';
import { useAccessToken } from '../useAccessToken';

export const usePerformance = (): UsePerformanceResult => {
  // Behind auth: the Backend resolves the owning Learner from this token.
  const { token } = useAccessToken();

  const { data, isLoading, error } = useApiResource<PerformanceResponse>(
    buildApiUrl(`${API_ROUTES.attempts}/${ATTEMPTS_PERFORMANCE_SEGMENT}`),
    { authToken: token },
  );

  // Surface no partial or stale analytics on failure: expose `null` and let the
  // consumer render the error.
  const performance = error !== null ? null : (data?.performance ?? null);

  const isEmpty =
    error === null &&
    !isLoading &&
    performance !== null &&
    performance.totalAttempts === 0;

  return { performance, isLoading, error, isEmpty };
};
