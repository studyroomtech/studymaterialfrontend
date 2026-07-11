"use client";

// SetPasswordModal component (Requirements 5.3, 5.4).
//
// A controlled, accessible modal that prompts a signed-in Learner to secure
// their account by setting a password. It mirrors the DownloadGateModal
// controlled-modal pattern: a blocking overlay, a `role="dialog"` /
// `aria-modal` container, Escape-key and overlay-click dismissal, focus moved
// to the first field on open, and a reset each time it opens.
//
// The `newPassword` field is always rendered; the `currentPassword` field is
// rendered only when `requireCurrentPassword` is true (the change-password
// case). Client-side `validatePassword` (8–128) mirrors the Backend API's
// bounds before `onSubmit` fires, and the submit action stays disabled until
// the new password is in-bounds (and the current password is non-empty when
// required). Backend 422 `fields` arrive via `fieldErrors` and render inline;
// any non-field error (including a mid-session 401) shows via `submitError`.
//
// All styling lives in `SetPasswordModal.module.scss` (no inline CSS) and the
// inputs and actions reuse the shared Input and Button components.

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { validatePassword } from "@/utils/validation";
import type { SetPasswordFieldErrors } from "@/hooks/api/useSetPassword.types";

import styles from "./SetPasswordModal.module.scss";
import {
  CANCEL_LABEL,
  CURRENT_PASSWORD_FIELD_ID,
  CURRENT_PASSWORD_LABEL,
  CURRENT_PASSWORD_PLACEHOLDER,
  DIALOG_DESCRIPTION,
  DIALOG_DESCRIPTION_ID,
  DIALOG_TITLE,
  DIALOG_TITLE_ID,
  NEW_PASSWORD_FIELD_ID,
  NEW_PASSWORD_LABEL,
  NEW_PASSWORD_PLACEHOLDER,
  SUBMIT_LABEL,
} from "./SetPasswordModal.constant";
import type { SetPasswordModalProps } from "./SetPasswordModal.types";

/**
 * Join a set of class names, dropping any falsy entries.
 * @param names candidate class names (falsy values are ignored).
 * @returns a space-separated className string.
 */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function SetPasswordModal({
  isOpen,
  requireCurrentPassword,
  onSubmit,
  onCancel,
  isSubmitting = false,
  fieldErrors,
  submitError,
  className,
}: SetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errors, setErrors] = useState<SetPasswordFieldErrors>({});

  // Reset the form each time the modal opens so a fresh prompt starts clean and
  // stale validation messages do not linger between activations.
  useEffect(() => {
    if (isOpen) {
      setNewPassword("");
      setCurrentPassword("");
      setErrors({});
    }
  }, [isOpen]);

  // Move focus to the first field when the modal opens (accessibility). The
  // field is located by id so the shared Input component needs no ref support.
  useEffect(() => {
    if (isOpen && typeof document !== "undefined") {
      document.getElementById(NEW_PASSWORD_FIELD_ID)?.focus();
    }
  }, [isOpen]);

  // Allow the Escape key to dismiss the modal while it is open (no submission
  // occurs, so the account stays unchanged).
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  // The submit action stays disabled until the new password is in-bounds (8–128)
  // and, when a current password is required, it is non-empty.
  const isValid = useMemo(() => {
    const newPasswordValid = validatePassword(newPassword).valid;
    if (requireCurrentPassword) {
      return newPasswordValid && currentPassword.length > 0;
    }
    return newPasswordValid;
  }, [newPassword, currentPassword, requireCurrentPassword]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const newPasswordResult = validatePassword(newPassword);
    const currentPasswordMissing =
      requireCurrentPassword && currentPassword.length === 0;

    // Apply client-side validation before emitting the submission (Req 5.3): a
    // mirror of the Backend API's bounds so an obvious out-of-bounds password
    // is caught early. The Backend API remains the authority.
    if (!newPasswordResult.valid || currentPasswordMissing) {
      setErrors({
        newPassword: newPasswordResult.valid
          ? undefined
          : newPasswordResult.reason,
        currentPassword: currentPasswordMissing
          ? "Current password is required."
          : undefined,
      });
      return;
    }

    setErrors({});
    onSubmit({
      newPassword,
      ...(requireCurrentPassword ? { currentPassword } : {}),
    });
  };

  const handleOverlayClick = (): void => {
    if (!isSubmitting) {
      onCancel();
    }
  };

  // Local (client-side) validation takes precedence; otherwise surface any
  // per-field error mapped from the backend's 422 response (Req 5.4).
  const newPasswordError = errors.newPassword ?? fieldErrors?.newPassword;
  const currentPasswordError =
    errors.currentPassword ?? fieldErrors?.currentPassword;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={classNames(styles.dialog, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DIALOG_TITLE_ID}
        aria-describedby={DIALOG_DESCRIPTION_ID}
        // Stop clicks inside the dialog from bubbling to the overlay dismiss.
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={DIALOG_TITLE_ID} className={styles.title}>
            {DIALOG_TITLE}
          </h2>
          <p id={DIALOG_DESCRIPTION_ID} className={styles.description}>
            {DIALOG_DESCRIPTION}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            id={NEW_PASSWORD_FIELD_ID}
            label={NEW_PASSWORD_LABEL}
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder={NEW_PASSWORD_PLACEHOLDER}
            value={newPassword}
            error={newPasswordError}
            disabled={isSubmitting}
            onChange={(event) => {
              setNewPassword(event.target.value);
              if (errors.newPassword) {
                setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }
            }}
          />

          {requireCurrentPassword && (
            <Input
              id={CURRENT_PASSWORD_FIELD_ID}
              label={CURRENT_PASSWORD_LABEL}
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder={CURRENT_PASSWORD_PLACEHOLDER}
              value={currentPassword}
              error={currentPasswordError}
              disabled={isSubmitting}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                if (errors.currentPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    currentPassword: undefined,
                  }));
                }
              }}
            />
          )}

          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {CANCEL_LABEL}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!isValid}
            >
              {SUBMIT_LABEL}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetPasswordModal;
