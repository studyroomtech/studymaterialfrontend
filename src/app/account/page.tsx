'use client';

// Account settings page (Req 5, 6.3–6.7).
//
// A lightweight account area where a Learner signs in with an email (and an
// optional password) and signs out, driven by the `useAccount` hook (which
// reuses the learner Access Token identity shared with the Download Gate):
//   - When signed in, the page shows the current identity and a Sign out action
//     that discards the stored token (Req 6.7). When the last successful
//     sign-in reported an Unprotected Account (`passwordProtected === false`),
//     it also renders the "Secure your account with a password" prompt and a
//     set-password action (Req 5.1, 5.3); activating it opens `SetPasswordModal`
//     in first-time-set mode. A successful set flips the account to protected
//     via `markPasswordProtected`, unmounting the prompt (Req 5.4). When the
//     protection status is unknown (`null`) or protected (`true`), neither the
//     prompt nor the action is shown (Req 5.2, 5.4).
//   - When signed out, it shows name, email, and an optional password field plus
//     a Sign in action that posts them to the Backend, persists the issued
//     Access Token, and reflects the signed-in state (Req 6.3–6.5). A Backend
//     rejection is surfaced inline via the uniform error message without
//     clearing the entered values (Req 8.1). After an Unprotected sign-in the
//     learner stays on this page so the prompt is visible (Req 5.1); a Protected
//     sign-in redirects to the base URL.
//
// Rendering is gated until after mount so the token re-synced from storage is
// reflected before deciding which view to show. All styling lives in
// `page.module.scss` (no inline CSS); the field and actions reuse the shared
// Input, Button, and ErrorMessage components.

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import SecureAccountPrompt from '@/components/SecureAccountPrompt/SecureAccountPrompt';
import SetPasswordModal from '@/components/SetPasswordModal/SetPasswordModal';
import { useAccount } from '@/hooks/api/useAccount';
import { useSetPassword } from '@/hooks/api/useSetPassword';
import type {
  SetPasswordFieldErrors,
  SetPasswordValues,
} from '@/hooks/api/useSetPassword.types';
import { isValidEmail, validateName } from '@/utils/validation';

import styles from './page.module.scss';
import {
  ACCOUNT_SUBTITLE,
  ACCOUNT_TITLE,
  EMAIL_FIELD_ID,
  EMAIL_IDENTITY_LABEL,
  EMAIL_LABEL,
  EMAIL_PLACEHOLDER,
  EMAIL_REQUIRED_ERROR,
  HOME_PATH,
  LOGOUT_LABEL,
  NAME_FIELD_ID,
  NAME_IDENTITY_LABEL,
  NAME_LABEL,
  NAME_PLACEHOLDER,
  NAME_REQUIRED_ERROR,
  PASSWORD_AUTOCOMPLETE,
  PASSWORD_FIELD_ID,
  PASSWORD_LABEL,
  PASSWORD_PLACEHOLDER,
  SIGN_IN_ERROR_TITLE,
  SIGN_IN_FALLBACK_ERROR,
  SIGN_IN_HEADING,
  SIGN_IN_SUBMIT_LABEL,
  SIGNED_IN_AS_LABEL,
} from './page.constant';

function AccountPage() {
  const router = useRouter();
  const {
    name,
    email,
    isLoggedIn,
    isLoading,
    error,
    passwordProtected,
    login,
    logout,
    markPasswordProtected,
  } = useAccount();
  const { isSubmitting, setPassword } = useSetPassword();

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [hasAttempted, setHasAttempted] = useState(false);

  // A successful sign-in defers the redirect decision to an effect that reads
  // the (asynchronously updated) `passwordProtected` tri-state (Req 5.1).
  const [justSignedIn, setJustSignedIn] = useState(false);

  // Set-password modal state (first-time-set flow) and the outcome mapping the
  // hook surfaces for the modal (Req 5.3, 5.4).
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);
  const [setPasswordFieldErrors, setSetPasswordFieldErrors] = useState<
    SetPasswordFieldErrors | undefined
  >(undefined);
  const [setPasswordSubmitError, setSetPasswordSubmitError] = useState<
    string | undefined
  >(undefined);

  // Gate rendering until mounted so the identity re-synced from storage is
  // reflected before choosing the signed-in vs signed-out view.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // After a successful sign-in, decide where to go based on the protection
  // status: an Unprotected Account (`false`) stays here so the "secure your
  // account" prompt is visible (Req 5.1); a Protected Account (`true`) is sent
  // to the base URL, preserving the prior redirect behavior.
  useEffect(() => {
    if (!justSignedIn) {
      return;
    }
    if (passwordProtected === false) {
      setNameInput('');
      setEmailInput('');
      setPasswordInput('');
      setJustSignedIn(false);
    } else if (passwordProtected === true) {
      setJustSignedIn(false);
      router.replace(HOME_PATH);
    }
  }, [justSignedIn, passwordProtected, router]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedEmail = emailInput.trim();

    const nextErrors: { name?: string; email?: string } = {};
    if (!validateName(trimmedName).valid) {
      nextErrors.name = NAME_REQUIRED_ERROR;
    }
    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = EMAIL_REQUIRED_ERROR;
    }
    if (nextErrors.name || nextErrors.email) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setHasAttempted(true);
    // The optional password is passed through; `login` only sends it when
    // non-empty, so an empty value is an email-only sign-in (Req 3, 4).
    const succeeded = await login(trimmedName, trimmedEmail, passwordInput);
    if (succeeded) {
      setHasAttempted(false);
      // Defer the redirect/stay decision to the effect once `passwordProtected`
      // reflects the sign-in response (Req 5.1). Entered values are preserved
      // until then (and cleared only when we remain on an Unprotected sign-in).
      setJustSignedIn(true);
    }
  };

  const handleLogout = (): void => {
    setNameInput('');
    setEmailInput('');
    setPasswordInput('');
    setFieldErrors({});
    setHasAttempted(false);
    logout();
  };

  const handleOpenSetPassword = (): void => {
    setSetPasswordFieldErrors(undefined);
    setSetPasswordSubmitError(undefined);
    setIsSetPasswordModalOpen(true);
  };

  const handleCancelSetPassword = (): void => {
    setIsSetPasswordModalOpen(false);
    setSetPasswordFieldErrors(undefined);
    setSetPasswordSubmitError(undefined);
  };

  const handleSubmitSetPassword = async (
    values: SetPasswordValues,
  ): Promise<void> => {
    const outcome = await setPassword(values);
    if (outcome.ok) {
      // The account is now Password-Protected: flip the persisted status so the
      // prompt/action unmount, and close the modal (Req 5.4).
      markPasswordProtected();
      setIsSetPasswordModalOpen(false);
      setSetPasswordFieldErrors(undefined);
      setSetPasswordSubmitError(undefined);
      return;
    }
    // Surface the failure in the modal without closing it (Req 5.4).
    setSetPasswordFieldErrors(outcome.fieldErrors);
    setSetPasswordSubmitError(outcome.submitError);
  };

  if (!hasMounted) {
    return (
      <main className={styles.main}>
        <section className={styles.card}>
          <LoadingIndicator />
        </section>
      </main>
    );
  }

  // Surface a Backend rejection only after an attempt so the banner does not
  // appear on first render (Req 8.1). Protected-account rejections arrive as the
  // uniform error message with no field-level hint.
  const showError = hasAttempted && error !== null;

  // Render the prompt and set-password action only for an Unprotected Account
  // (Req 5.1, 5.3); the unknown (`null`) and protected (`true`) states show
  // nothing (Req 5.2, 5.4).
  const showSecurePrompt = passwordProtected === false;

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{ACCOUNT_TITLE}</h1>
          <p className={styles.subtitle}>{ACCOUNT_SUBTITLE}</p>
        </header>

        {isLoggedIn ? (
          <>
            <div className={styles.identity}>
              <span className={styles.identityLabel}>{SIGNED_IN_AS_LABEL}</span>
              {name ? (
                <p className={styles.identityEmail}>
                  <span className={styles.identityFieldLabel}>
                    {NAME_IDENTITY_LABEL}:{' '}
                  </span>
                  {name}
                </p>
              ) : null}
              <p className={styles.identityEmail}>
                <span className={styles.identityFieldLabel}>
                  {EMAIL_IDENTITY_LABEL}:{' '}
                </span>
                {email}
              </p>
            </div>

            {showSecurePrompt && (
              <SecureAccountPrompt
                className={styles.prompt}
                onSetPassword={handleOpenSetPassword}
              />
            )}

            <div className={styles.actions}>
              <Button variant="secondary" fullWidth onClick={handleLogout}>
                {LOGOUT_LABEL}
              </Button>
            </div>

            {showSecurePrompt && (
              <SetPasswordModal
                isOpen={isSetPasswordModalOpen}
                requireCurrentPassword={false}
                isSubmitting={isSubmitting}
                fieldErrors={setPasswordFieldErrors}
                submitError={setPasswordSubmitError}
                onSubmit={(values) => {
                  void handleSubmitSetPassword(values);
                }}
                onCancel={handleCancelSetPassword}
              />
            )}
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <h2 className={styles.subtitle}>{SIGN_IN_HEADING}</h2>
            <Input
              id={NAME_FIELD_ID}
              label={NAME_LABEL}
              name="name"
              type="text"
              autoComplete="name"
              placeholder={NAME_PLACEHOLDER}
              value={nameInput}
              error={fieldErrors.name}
              disabled={isLoading}
              onChange={(event) => {
                setNameInput(event.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
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
              value={emailInput}
              error={fieldErrors.email}
              disabled={isLoading}
              onChange={(event) => {
                setEmailInput(event.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
            />
            <div className={styles.passwordField}>
              <Input
                id={PASSWORD_FIELD_ID}
                label={PASSWORD_LABEL}
                name="password"
                type="password"
                autoComplete={PASSWORD_AUTOCOMPLETE}
                placeholder={PASSWORD_PLACEHOLDER}
                value={passwordInput}
                disabled={isLoading}
                onChange={(event) => {
                  setPasswordInput(event.target.value);
                }}
              />
            </div>

            {showError && (
              <ErrorMessage
                title={SIGN_IN_ERROR_TITLE}
                message={error?.message ?? SIGN_IN_FALLBACK_ERROR}
              />
            )}

            <div className={styles.actions}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                {SIGN_IN_SUBMIT_LABEL}
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default AccountPage;
