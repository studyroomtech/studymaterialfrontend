"use client";

// DownloadGateModal component (Requirements 6.1, 6.7).
//
// A controlled, accessible modal that prompts the Learner for a name and email
// before a Study Material download proceeds. It is shown by the parent when no
// valid Access Token is present (Req 6.1) or the current token is expired /
// invalid (Req 6.7), and it blocks the download until valid details are
// submitted: `onSubmit` only fires once both fields pass client-side validation
// that mirrors the Backend API's bounds (name 1–100, email 1–254 + format).
//
// All styling lives in `DownloadGateModal.module.scss` (no inline CSS) and the
// stylesheet consumes the shared theme. The name/email inputs and actions reuse
// the shared Input and Button components.

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import Button from "../Button/Button";
import Input from "../Input/Input";
import { validateEmail, validateName } from "../../utils/validation";
import styles from "./DownloadGateModal.module.scss";
import {
  CANCEL_LABEL,
  DIALOG_DESCRIPTION,
  DIALOG_DESCRIPTION_ID,
  DIALOG_TITLE,
  DIALOG_TITLE_ID,
  EMAIL_FIELD_ID,
  EMAIL_LABEL,
  EMAIL_PLACEHOLDER,
  NAME_FIELD_ID,
  NAME_LABEL,
  NAME_PLACEHOLDER,
  SUBMIT_LABEL,
} from "./DownloadGateModal.constant";
import type {
  DownloadGateFieldErrors,
  DownloadGateModalProps,
} from "./DownloadGateModal.types";

/**
 * Join a set of class names, dropping any falsy entries.
 * @param names candidate class names (falsy values are ignored).
 * @returns a space-separated className string.
 */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function DownloadGateModal({
  isOpen,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
  className,
}: DownloadGateModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<DownloadGateFieldErrors>({});

  // Reset the form each time the gate opens so a fresh prompt starts clean and
  // stale validation messages do not linger between downloads.
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setErrors({});
    }
  }, [isOpen]);

  // Move focus to the first field when the gate opens (accessibility). The
  // field is located by id so the shared Input component needs no ref support.
  useEffect(() => {
    if (isOpen && typeof document !== "undefined") {
      document.getElementById(NAME_FIELD_ID)?.focus();
    }
  }, [isOpen]);

  // Allow the Escape key to dismiss the gate while it is open (Req 6.1: the
  // download stays blocked because no submission occurs).
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

  const isValid = useMemo(
    () => validateName(name).valid && validateEmail(email).valid,
    [name, email],
  );

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nameResult = validateName(name);
    const emailResult = validateEmail(email);

    // Block the download until both fields are valid (Req 6.1): surface the
    // per-field reasons and do not emit the submission.
    if (!nameResult.valid || !emailResult.valid) {
      setErrors({
        name: nameResult.valid ? undefined : nameResult.reason,
        email: emailResult.valid ? undefined : emailResult.reason,
      });
      return;
    }

    setErrors({});
    onSubmit({ name: name.trim(), email: email.trim() });
  };

  const handleOverlayClick = (): void => {
    if (!isSubmitting) {
      onCancel();
    }
  };

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
            id={NAME_FIELD_ID}
            label={NAME_LABEL}
            name="name"
            type="text"
            autoComplete="name"
            placeholder={NAME_PLACEHOLDER}
            value={name}
            error={errors.name}
            disabled={isSubmitting}
            onChange={(event) => {
              setName(event.target.value);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
          />

          <Input
            id={EMAIL_FIELD_ID}
            label={EMAIL_LABEL}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={EMAIL_PLACEHOLDER}
            value={email}
            error={errors.email}
            disabled={isSubmitting}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
          />

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

export default DownloadGateModal;
