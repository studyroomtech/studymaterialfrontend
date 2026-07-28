'use client';

// `useSubmitReview` — upsert or delete the signed-in learner's review for a
// Study Material via `POST` / `DELETE /api/materials/:id/reviews`.
//
// Reads the learner's raw Access Token from `useAccessToken().token` and sends
// it as an `Authorization: Bearer <token>` header. Calls go through the shared
// `httpRequest` wrapper with `suppressErrorToast: true` so the reviews section
// renders its own inline error (distinguishing 401 auth / 403 payment / 422
// validation) rather than surfacing a duplicate global toast.
//
// `submit` upserts `{ rating, body? }` (one review per user per material,
// editable); `remove` deletes the caller's own review. Both return a typed
// outcome and update `isSubmitting`/`error` for the form's loading and error
// states. When no token is present the request is skipped with a synthesized
// auth error, since there is no identity to authenticate.

import { useCallback, useState } from 'react';

import { httpRequest } from '@/utils/http';
import { HTTP_ERROR_KIND } from '@/utils/http.constant';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES, MATERIAL_REVIEWS_ACTION } from './apiClient.constant';
import type { MaterialReview } from './apiHooks.types';
import type {
  DeleteReviewOutcome,
  SubmitReviewOutcome,
  SubmitReviewValues,
  UseSubmitReviewResult,
} from './useSubmitReview.types';
import { useAccessToken } from '../useAccessToken';

/** JSON request headers shared by the review write calls. */
const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/** Message surfaced when there is no signed-in identity to authenticate. */
const MISSING_TOKEN_MESSAGE = 'You must be signed in to review this material.';

/** A synthesized auth error used when no token is present. */
const missingTokenError = (): HttpError => ({
  kind: HTTP_ERROR_KIND.api,
  message: MISSING_TOKEN_MESSAGE,
  status: 401,
  code: 'AUTH_REQUIRED',
});

export const useSubmitReview = (
  materialId: string | null,
): UseSubmitReviewResult => {
  const { token } = useAccessToken();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<HttpError | null>(null);

  const reviewsUrl = useCallback((): string | null => {
    if (materialId === null || materialId.length === 0) {
      return null;
    }
    return buildApiUrl(
      `${API_ROUTES.material}/${encodeURIComponent(
        materialId,
      )}/${MATERIAL_REVIEWS_ACTION}`,
    );
  }, [materialId]);

  const submit = useCallback(
    async ({ rating, body }: SubmitReviewValues): Promise<SubmitReviewOutcome> => {
      const url = reviewsUrl();
      if (url === null) {
        const err = missingTokenError();
        setError(err);
        return { ok: false, error: err };
      }
      if (token === null || token.length === 0) {
        const err = missingTokenError();
        setError(err);
        return { ok: false, error: err };
      }

      setIsSubmitting(true);
      setError(null);

      const payload: SubmitReviewValues = { rating };
      if (typeof body === 'string') {
        payload.body = body;
      }

      const result = await httpRequest<MaterialReview>(url, {
        method: 'POST',
        headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        suppressErrorToast: true,
      });

      setIsSubmitting(false);

      if (result.ok) {
        setError(null);
        return { ok: true, review: result.data };
      }
      setError(result.error);
      return { ok: false, error: result.error };
    },
    [reviewsUrl, token],
  );

  const remove = useCallback(async (): Promise<DeleteReviewOutcome> => {
    const url = reviewsUrl();
    if (url === null || token === null || token.length === 0) {
      const err = missingTokenError();
      setError(err);
      return { ok: false, error: err };
    }

    setIsSubmitting(true);
    setError(null);

    const result = await httpRequest<unknown>(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      suppressErrorToast: true,
    });

    setIsSubmitting(false);

    if (result.ok) {
      setError(null);
      return { ok: true };
    }
    setError(result.error);
    return { ok: false, error: result.error };
  }, [reviewsUrl, token]);

  return { submit, remove, isSubmitting, error };
};
