'use client';

// `usePaidMaterials` — list Paid Materials with their Prices from
// `GET /api/materials/paid` (Req 12.1).
//
// Returns `{ data, isLoading, error }` so the Paid Materials Tab can render a
// loading indicator while the listing is fetched (Req 7.3) and an error message
// while preserving the current view when the request fails or times out
// (Req 8.1, 8.2). The listing surfaces each Paid Material's title, Price amount,
// and Currency; content access stays gated by a Payment Entitlement (Req 12.3).

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import type { AsyncState } from './apiHooks.types';
import type { PaidMaterialsResult } from './usePaidMaterials.types';
import { useApiResource } from './useApiResource';
import { useAccessToken } from '../useAccessToken';

export const usePaidMaterials = (): AsyncState<PaidMaterialsResult> => {
  // Send the learner Access Token so the Backend can flag already-purchased
  // materials (`isEntitled`) for the current Learner.
  const { token } = useAccessToken();
  return useApiResource<PaidMaterialsResult>(
    buildApiUrl(API_ROUTES.materialsPaid),
    { authToken: token },
  );
};
