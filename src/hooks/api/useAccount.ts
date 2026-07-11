'use client';

// `useAccount` — email-only learner sign-in and sign-out (Req 6.3–6.7), with an
// optional password for protected-account sign-in and a persisted tri-state
// protection status (Req 5.1, 5.2, 5.4).
//
// Backs the account settings area. It layers a lightweight sign-in on top of
// the existing learner Access Token identity used by the Download Gate:
//   - `login(name, email, password?)` POSTs the name + email (and the password
//     only when a non-empty one is supplied) to `/api/account/login`; the
//     Backend resolves (or creates) the User Record and returns a learner
//     Access Token, which is persisted via `useAccessToken` so downloads reuse
//     the same identity without re-prompting (Req 6.2–6.5). The response's
//     `passwordProtected` flag is persisted to `localStorage` and exposed as a
//     tri-state so the settings UI can prompt (or not) after a reload (Req 5).
//   - `markPasswordProtected()` flips the persisted status to protected without
//     another login, for use right after a set-password succeeds (Req 5.4).
//   - `logout()` discards the stored token and the protection status; the JWT is
//     stateless, so sign-out is purely client-side (Req 6.7).
//   - `name`/`email`/`isLoggedIn` reflect the current identity, decoded from the
//     token by `useAccessToken`, so the page can render the signed-in state
//     after a reload without a network round-trip (Req 6.2, 6.5, 6.6).
//
// A shared `{ isLoading, error }` state drives the sign-in loading indicator
// and error message while preserving any entered email on failure (Req 7.3, 8.1).

import { useCallback, useEffect, useMemo, useState } from 'react';

import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import {
  ACCOUNT_PROTECTION_MARKER,
  ACCOUNT_PROTECTION_STORAGE_KEY,
} from './useAccount.constant';
import type {
  AccountLoginResponse,
  AccountMeResponse,
  UseAccountResult,
} from './useAccount.types';
import { useAccessToken } from '../useAccessToken';

/** JSON request headers shared by the sign-in call. */
const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/** Whether a browser environment (with `window`) is available (mirrors `useAccessToken`). */
const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * Read the persisted protection status as a tri-state (Req 5.1, 5.2, 5.4):
 *   - `ACCOUNT_PROTECTION_MARKER.unprotected` → `false`
 *   - `ACCOUNT_PROTECTION_MARKER.protected`   → `true`
 *   - absent / unrecognized (incl. SSR)       → `null`
 */
const readProtectionStatus = (): boolean | null => {
  if (!isBrowser()) {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(ACCOUNT_PROTECTION_STORAGE_KEY);
    if (stored === ACCOUNT_PROTECTION_MARKER.protected) {
      return true;
    }
    if (stored === ACCOUNT_PROTECTION_MARKER.unprotected) {
      return false;
    }
  } catch {
    // Ignore storage failures (e.g. private mode) and fall back to unknown.
  }
  return null;
};

/** Persist the protection status marker, guarded against SSR/storage errors. */
const writeProtectionStatus = (isProtected: boolean): void => {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.setItem(
      ACCOUNT_PROTECTION_STORAGE_KEY,
      isProtected
        ? ACCOUNT_PROTECTION_MARKER.protected
        : ACCOUNT_PROTECTION_MARKER.unprotected,
    );
  } catch {
    // Ignore storage failures; the in-memory state still updates.
  }
};

/** Remove the persisted protection status (on sign-out), guarded against SSR. */
const clearProtectionStatus = (): void => {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.removeItem(ACCOUNT_PROTECTION_STORAGE_KEY);
  } catch {
    // Ignore storage failures; the in-memory state still updates.
  }
};

export const useAccount = (): UseAccountResult => {
  const { token, name, email, hasValidToken, setToken, clearToken } =
    useAccessToken();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<HttpError | null>(null);
  const [passwordProtected, setPasswordProtected] = useState<boolean | null>(
    () => readProtectionStatus(),
  );

  // Reconcile the protection status with the source of truth. The persisted
  // tri-state can drift from the DB (e.g. a password was set on another device,
  // or a token predates the password), which would wrongly show/hide the
  // "secure your account" prompt. Whenever a valid token is present, fetch the
  // authoritative profile from `/api/account/me` and adopt its
  // `passwordProtected` value; a 401 means the token is stale, so clear it.
  useEffect(() => {
    if (!hasValidToken || token === null) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const result = await httpRequest<AccountMeResponse>(
        buildApiUrl(API_ROUTES.accountMe),
        {
          method: 'GET',
          headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
          // Reconciliation is a background check; surface no toast on failure.
          suppressErrorToast: true,
        },
      );
      if (cancelled) {
        return;
      }
      if (result.ok) {
        writeProtectionStatus(result.data.passwordProtected);
        setPasswordProtected(result.data.passwordProtected);
        return;
      }
      // A stale/invalid token: clear it so the signed-in view drops back to the
      // sign-in form (which will require the password for a protected account).
      if (result.error.status === 401) {
        clearToken();
        clearProtectionStatus();
        setPasswordProtected(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasValidToken, token, clearToken]);

  const login = useCallback(
    async (
      submittedName: string,
      submittedEmail: string,
      password?: string,
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      // Include the password only when a non-empty one is supplied; otherwise
      // this is an email-only sign-in (Req 5.1, 6.3).
      const body: {
        name: string;
        email: string;
        password?: string;
      } = { name: submittedName, email: submittedEmail };
      if (typeof password === 'string' && password.length > 0) {
        body.password = password;
      }

      const result = await httpRequest<AccountLoginResponse>(
        buildApiUrl(API_ROUTES.accountLogin),
        {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify(body),
          // Sign-in failures show inline via the account page's error banner;
          // suppress the global toast to avoid a duplicate message.
          suppressErrorToast: true,
        },
      );

      setIsLoading(false);

      if (!result.ok) {
        // Preserve the entered email; surface the failure (Req 8.1).
        setError(result.error);
        return false;
      }

      // Persist the issued learner Access Token so downloads reuse the identity
      // (Req 6.4, 6.5).
      setToken(result.data.accessToken);
      // Persist and expose the account's protection status (Req 5.1, 5.2).
      writeProtectionStatus(result.data.passwordProtected);
      setPasswordProtected(result.data.passwordProtected);
      return true;
    },
    [setToken],
  );

  const markPasswordProtected = useCallback((): void => {
    // Flip the persisted status to protected without another login, e.g. right
    // after a set-password succeeds (Req 5.4).
    writeProtectionStatus(true);
    setPasswordProtected(true);
  }, []);

  const logout = useCallback((): void => {
    setError(null);
    clearToken();
    // Discard the protection status alongside the token (Req 6.7).
    clearProtectionStatus();
    setPasswordProtected(null);
  }, [clearToken]);

  return useMemo<UseAccountResult>(
    () => ({
      name,
      email,
      isLoggedIn: hasValidToken,
      isLoading,
      error,
      passwordProtected,
      login,
      logout,
      markPasswordProtected,
    }),
    [
      name,
      email,
      hasValidToken,
      isLoading,
      error,
      passwordProtected,
      login,
      logout,
      markPasswordProtected,
    ],
  );
};
