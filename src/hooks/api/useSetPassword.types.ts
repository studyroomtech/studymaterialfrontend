// Type declarations for the `useSetPassword` hook. All type/interface
// declarations live here so the hook module stays free of type declarations
// (Req 1.15, 1.17).
//
// The set-password hook backs the "secure your account" flow: an authenticated
// `POST /api/account/password` call that stores a password on the signed-in
// Learner's User Record (Req 5.3, 5.4). These types are also the source of
// truth for the `SetPasswordModal` component, which consumes
// {@link SetPasswordValues} and {@link SetPasswordFieldErrors}.

/**
 * The values a Learner submits to set a password. `newPassword` is always
 * required; `currentPassword` is only supplied when re-setting the password on
 * an already Password-Protected Account (Req 5.3, 5.4).
 */
export interface SetPasswordValues {
  /** The new password to store on the User Record (8–128 characters). */
  newPassword: string;
  /** The current password, required only when the account is already protected. */
  currentPassword?: string;
}

/**
 * Per-field validation errors mapped from the backend's 422 `VALIDATION_ERROR`
 * `fields` array, keyed by the offending field so the modal can render an inline
 * error next to the matching `Input` (Req 5.4).
 */
export interface SetPasswordFieldErrors {
  /** Validation error for the `newPassword` field, when present. */
  newPassword?: string;
  /** Validation error for the `currentPassword` field, when present. */
  currentPassword?: string;
}

/**
 * The outcome of a set-password attempt: either a success, or a failure that
 * carries per-field errors (from a 422) and/or a non-field submit error (e.g. a
 * mid-session 401 or other failure) for the caller to surface (Req 5.3, 5.4).
 */
export type SetPasswordOutcome =
  | { ok: true }
  | { ok: false; fieldErrors?: SetPasswordFieldErrors; submitError?: string };

/**
 * Value returned by {@link useSetPassword}. Exposes the in-flight state and the
 * authenticated `setPassword` operation that stores a password on the signed-in
 * Learner's User Record (Req 5.3, 5.4).
 */
export interface UseSetPasswordResult {
  /** `true` while a set-password request is in flight. */
  isSubmitting: boolean;
  /**
   * Submit a new password (with the current password when the account is
   * already protected) to `POST /api/account/password`, resolving with the
   * {@link SetPasswordOutcome}.
   */
  setPassword: (input: SetPasswordValues) => Promise<SetPasswordOutcome>;
}
