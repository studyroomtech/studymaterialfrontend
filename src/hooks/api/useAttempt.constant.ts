// Constants for the `useAttempt` orchestration hook (`useAttempt.ts`).
//
// Centralizes the JSON request headers, the Backend API status/code
// discriminants used to classify an attempt-request failure into a
// UI-consumable {@link AttemptOutcome}, and the user-facing messages surfaced
// when the hook short-circuits without a network call (Req 8.x). Values only —
// all type declarations live in `useAttempt.types.ts` (Req 1.15, 1.17).

/** JSON request headers shared by every attempt POST call. */
export const ATTEMPT_JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/** HTTP 401 — no/expired learner Access Token (`AUTH_REQUIRED`). */
export const ATTEMPT_AUTH_REQUIRED_STATUS = 401;

/** HTTP 403 — the Paid-Test entitlement gate (`PAYMENT_REQUIRED`, Req 8.x). */
export const ATTEMPT_PAYMENT_REQUIRED_STATUS = 403;

/** HTTP 404 — no such Test / Section / attempt. */
export const ATTEMPT_NOT_FOUND_STATUS = 404;

/** HTTP 422 — a rejected transition/Response (Req 10.4, 11.3, 12.4). */
export const ATTEMPT_VALIDATION_STATUS = 422;

/**
 * Backend API error code accompanying a {@link ATTEMPT_PAYMENT_REQUIRED_STATUS}
 * response, identifying the entitlement gate so a 403 that is not this code
 * still maps to a generic `error` outcome (Req 8.x).
 */
export const ATTEMPT_PAYMENT_REQUIRED_CODE = 'PAYMENT_REQUIRED';

/**
 * Message surfaced when an operation is attempted without a valid learner
 * Access Token, so the caller can prompt for sign-in before any network call
 * (Req 8.x).
 */
export const ATTEMPT_AUTH_REQUIRED_MESSAGE =
  'Please sign in to start or continue this test.';

/**
 * Message surfaced when a lifecycle action (pause/resume/respond/submit) is
 * requested while no attempt has been started/resumed in this hook.
 */
export const ATTEMPT_NO_ACTIVE_ATTEMPT_MESSAGE =
  'No active attempt to act on. Start or resume a test first.';
