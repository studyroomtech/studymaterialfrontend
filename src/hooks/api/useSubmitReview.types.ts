// Types for `useSubmitReview` (upsert/delete a material review).

import type { HttpError } from '@/utils/http.types';
import type { MaterialReview } from './apiHooks.types';

/** The values submitted when a learner rates/reviews a material. */
export interface SubmitReviewValues {
  /** Required star rating, an integer 1–5. */
  rating: number;
  /** Optional written review body (0–2000 chars). */
  body?: string;
}

/**
 * The outcome of a submit/delete call. `ok` signals success; the failure branch
 * carries the typed `HttpError` so the caller can surface an inline message and
 * distinguish auth (401) / payment (403) / validation (422) cases.
 */
export type SubmitReviewOutcome =
  | { ok: true; review: MaterialReview }
  | { ok: false; error: HttpError };

export type DeleteReviewOutcome =
  | { ok: true }
  | { ok: false; error: HttpError };

/** The imperative API returned by {@link useSubmitReview}. */
export interface UseSubmitReviewResult {
  /** Upsert the caller's rating/review for the material. */
  submit(values: SubmitReviewValues): Promise<SubmitReviewOutcome>;
  /** Delete the caller's own review for the material. */
  remove(): Promise<DeleteReviewOutcome>;
  /** `true` while a submit or delete request is in flight. */
  isSubmitting: boolean;
  /** The most recent failure, or `null` when the last call succeeded. */
  error: HttpError | null;
}
