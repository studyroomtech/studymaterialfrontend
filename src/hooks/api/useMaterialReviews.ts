'use client';

// `useMaterialReviews` — load a Study Material's reviews from
// `GET /api/materials/:id/reviews`.
//
// Returns `{ data, isLoading, error }` where `data` carries the review list plus
// the aggregate (`averageRating`/`reviewCount`), whether the caller may submit a
// review (`canReview`), and the caller's own review (`myReview`) for prefill.
//
// The learner Access Token is forwarded so the Backend can resolve the caller
// and compute `isOwn`/`canReview`/`myReview`; reviews are public, so a signed-out
// caller still receives the list and aggregate. A change to `reloadKey` forces a
// refetch after the caller submits or deletes a review, and a change to the
// token refetches so a fresh sign-in re-resolves the caller. Passing an
// empty/`null` id leaves the hook idle.

import { buildApiUrl } from './apiClient';
import { API_ROUTES, MATERIAL_REVIEWS_ACTION } from './apiClient.constant';
import type { AsyncState, MaterialReviewsResult } from './apiHooks.types';
import { useApiResource } from './useApiResource';
import { useAccessToken } from '../useAccessToken';

export const useMaterialReviews = (
  materialId: string | null,
  reloadKey = 0,
): AsyncState<MaterialReviewsResult> => {
  const { token } = useAccessToken();

  const baseUrl =
    materialId !== null && materialId.length > 0
      ? buildApiUrl(
          `${API_ROUTES.material}/${encodeURIComponent(
            materialId,
          )}/${MATERIAL_REVIEWS_ACTION}`,
        )
      : null;

  // Append a cache-busting reload key so a submit/delete re-fetches the list and
  // aggregate. `useApiResource` re-fetches whenever the URL changes.
  const url =
    baseUrl === null
      ? null
      : reloadKey > 0
        ? `${baseUrl}?_r=${reloadKey}`
        : baseUrl;

  return useApiResource<MaterialReviewsResult>(url, { authToken: token });
};
