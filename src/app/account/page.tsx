'use client';

// Account settings page (Req 6.3–6.7).
//
// A lightweight account area where a Learner signs in with just an email and
// signs out, driven by the `useAccount` hook (which reuses the learner Access
// Token identity shared with the Download Gate):
//   - When signed in, the page shows the current email and a Sign out action
//     that discards the stored token (Req 6.7).
//   - When signed out, it shows an email field and a Sign in action that posts
//     the email to the Backend, persists the issued Access Token, and reflects
//     the signed-in state (Req 6.3–6.5). A Backend rejection is surfaced inline
//     without clearing the entered email (Req 8.1).
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
import { useAccount } from '@/hooks/api/useAccount';
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
  SIGN_IN_ERROR_TITLE,
  SIGN_IN_FALLBACK_ERROR,
  SIGN_IN_HEADING,
  SIGN_IN_SUBMIT_LABEL,
  SIGNED_IN_AS_LABEL,
} from './page.constant';

function AccountPage() {
  const router = useRouter();
  const { name, email, isLoggedIn, isLoading, error, login, logout } =
    useAccount();

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [hasAttempted, setHasAttempted] = useState(false);

  // Gate rendering until mounted so the identity re-synced from storage is
  // reflected before choosing the signed-in vs signed-out view.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

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
    const succeeded = await login(trimmedName, trimmedEmail);
    if (succeeded) {
      setNameInput('');
      setEmailInput('');
      setHasAttempted(false);
      // On success, send the learner to the base URL instead of staying here.
      router.replace(HOME_PATH);
    }
  };

  const handleLogout = (): void => {
    setNameInput('');
    setEmailInput('');
    setFieldErrors({});
    setHasAttempted(false);
    logout();
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
  // appear on first render (Req 8.1).
  const showError = hasAttempted && error !== null;

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
            <div className={styles.actions}>
              <Button variant="secondary" fullWidth onClick={handleLogout}>
                {LOGOUT_LABEL}
              </Button>
            </div>
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
