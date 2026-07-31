// Type declarations for the `usePerformance` API-call hook. All type/interface
// declarations live here so the hook module stays free of them (matching the
// `.types.ts` / `.ts` convention used across `hooks/api/`).
//
// The hook loads the signed-in Learner's performance across every completed
// attempt from `GET /api/attempts/performance`. The DTO shapes are reused from
// the shared client-side contract in `@/types/testSeries.types` so the client
// is strictly typed against the server response.

import type { PerformanceDto } from '@/types/testSeries.types';
import type { HttpError } from '@/utils/http.types';

/**
 * Response body of `GET /api/attempts/performance`: the caller's overall
 * totals, per-Test trend, and per-Section strong/weak ranking. A Learner with
 * no completed attempts receives a zeroed report rather than an error.
 */
export interface PerformanceResponse {
  performance: PerformanceDto;
}

/**
 * Value returned by {@link usePerformance}:
 *   - `performance` the loaded report, or `null` while loading and on failure
 *                   so no partial or stale analytics are surfaced.
 *   - `isLoading`   `true` while the request is in flight (Req 7.3).
 *   - `error`       the typed failure of the most recent request, or `null`.
 *   - `isEmpty`     `true` on a successful, settled load with no completed
 *                   attempts, driving the empty-state message.
 */
export interface UsePerformanceResult {
  performance: PerformanceDto | null;
  isLoading: boolean;
  error: HttpError | null;
  isEmpty: boolean;
}
