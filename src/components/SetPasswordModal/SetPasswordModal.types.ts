// Type declarations for the SetPasswordModal component (Requirements 5.3, 5.4).
//
// The modal backs the "secure your account" flow: it collects a new password
// (and, when changing an existing one, the current password) before emitting a
// submission the parent forwards to `POST /api/account/password`. The submitted
// values and per-field error shapes are reused from the `useSetPassword` hook so
// the modal and hook share a single source of truth.

import type {
  SetPasswordFieldErrors,
  SetPasswordValues,
} from "@/hooks/api/useSetPassword.types";

export type { SetPasswordFieldErrors, SetPasswordValues };

/**
 * Props for the SetPasswordModal.
 *
 * The modal is a controlled component: the parent decides when it is visible
 * (typically when a Learner activates the set-password action on an Unprotected
 * Account — Req 5.3) and reacts to a successful submission by marking the
 * account protected (Req 5.4).
 */
export interface SetPasswordModalProps {
  /** Whether the modal (and its blocking overlay) is rendered. */
  isOpen: boolean;
  /**
   * When true, the current-password field is rendered and required (the
   * change-password case). For the first-time-set flow (Req 5.3) this is
   * `false` and only the new-password field is shown.
   */
  requireCurrentPassword: boolean;
  /**
   * Called with the validated values once the Learner submits a `newPassword`
   * that passes client-side bounds (8–128), plus a non-empty `currentPassword`
   * when {@link SetPasswordModalProps.requireCurrentPassword} is true.
   */
  onSubmit: (values: SetPasswordValues) => void;
  /**
   * Called when the Learner dismisses the modal without submitting (Escape key,
   * overlay click, or the cancel action).
   */
  onCancel: () => void;
  /**
   * When true, the submit action shows a loading affordance and inputs are
   * disabled while the submission is in flight.
   */
  isSubmitting?: boolean;
  /**
   * Per-field errors mapped from the backend's 422 `VALIDATION_ERROR` `fields`
   * array, rendered inline next to the matching `Input` (Req 5.4).
   */
  fieldErrors?: SetPasswordFieldErrors;
  /**
   * A non-field error from a failed submission (e.g. a mid-session 401). It is
   * shown without clearing the entered values so the current view is preserved.
   */
  submitError?: string;
  /** Optional additional class name applied to the dialog element. */
  className?: string;
}
