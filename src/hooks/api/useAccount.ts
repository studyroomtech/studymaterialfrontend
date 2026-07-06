'use client';

// `useAccount` — email-only learner sign-in and sign-out (Req 6.3–6.7).
//
// Backs the account settings area. It layers a lightweight sign-in on top of
// the existing learner Access Token identity used by the Download Gate:
//   - `login(name, email)` POSTs the name + email to `/api/account/login`; the
//     Backend resolves (or creates) the User Record and returns a learner
//     Access Token, which is persisted via `useAccessToken` so downloads reuse
//     the same identity without re-prompting (Req 6.2–6.5).
//   - `logout()` discards the stored token (the JWT is stateless, so sign-out
//     is purely client-side) (Req 6.7).
//   - `name`/`email`/`isLoggedIn` reflect the current identity, decoded from the
//     token by `useAccessToken`, so the page can render the signed-in state
//     after a reload without a network round-trip (Req 6.2, 6.5, 6.6).
//
// A shared `{ isLoading, error }` state drives the sign-in loading indicator
// and error message while preserving any entered email on failure (Req 7.3, 8.1).

import { useCallback, useMemo, useState } from 'react';

import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import type {
  AccountLoginResponse,
  UseAccountResult,
} from './useAccount.types';
import { useAccessToken } from '../useAccessToken';

/** JSON request headers shared by the sign-in call. */
const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const useAccount = (): UseAccountResult => {
  const { name, email, hasValidToken, setToken, clearToken } = useAccessToken();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<HttpError | null>(null);

  const login = useCallback(
    async (submittedName: string, submittedEmail: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      const result = await httpRequest<AccountLoginResponse>(
        buildApiUrl(API_ROUTES.accountLogin),
        {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ name: submittedName, email: submittedEmail }),
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
      return true;
    },
    [setToken],
  );

  const logout = useCallback((): void => {
    setError(null);
    clearToken();
  }, [clearToken]);

  return useMemo<UseAccountResult>(
    () => ({
      name,
      email,
      isLoggedIn: hasValidToken,
      isLoading,
      error,
      login,
      logout,
    }),
    [name, email, hasValidToken, isLoading, error, login, logout],
  );
};
