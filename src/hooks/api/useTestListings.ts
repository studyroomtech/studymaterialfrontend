'use client';

// `useTestListings` — load the Home Page test listings from `GET /api/tests`
// (Req 6.1, 6.4, 6.7).
//
// Returns `{ testSeries, sectionalTests, isLoading, error }` so the Home Page
// can render a loading indicator while the listings are fetched (Req 6.5),
// per-section empty-states on empty success (Req 6.6), and an error message on
// failure. The server-provided order of each section is preserved verbatim —
// the hook never re-sorts (Req 6.4). On failure the listing arrays are empty so
// no partial or stale listings are surfaced (Req 6.7); the shared
// `useApiResource` retains its last successful `data` internally, so we gate the
// exposed arrays on the absence of an error rather than replaying stale data.
//
// The learner Access Token from `useAccessToken` is sent as an
// `Authorization: Bearer <token>` header (as `useAttemptHistory` does) so the
// Backend can identify the caller and resolve per-product ownership
// (`isEntitled`). When no token is present the request is anonymous and every
// product resolves to `isEntitled = false`, unchanged from before.

import type { TestListingsResponse } from '@/types/testSeries.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import type { TestListingsState } from './useTestListings.types';
import { useApiResource } from './useApiResource';
import { useAccessToken } from '../useAccessToken';

export const useTestListings = (): TestListingsState => {
  // Behind auth-aware ownership: the Backend resolves the calling Learner from
  // this token to mark each listing's `isEntitled`.
  const { token } = useAccessToken();

  const { data, isLoading, error } = useApiResource<TestListingsResponse>(
    buildApiUrl(API_ROUTES.tests),
    { authToken: token },
  );

  // On failure, surface no partial or stale listings (Req 6.7): expose empty
  // sections and let the consumer render the error. Otherwise pass the
  // server-provided entries through untouched, preserving their deterministic
  // order (Req 6.4).
  const testSeries = error !== null ? [] : (data?.testSeries ?? []);
  const sectionalTests = error !== null ? [] : (data?.sectionalTests ?? []);

  return { testSeries, sectionalTests, isLoading, error };
};
