// Type declarations for the `useAccount` hook. All type/interface declarations
// live here so the hook module stays free of type declarations (Req 1.15, 1.17).
//
// The account hook backs the account settings area: a name + email sign-in that
// reuses the learner Access Token identity, plus sign-out (Req 6.2–6.7).

import type { HttpError } from '@/utils/http.types';

/**
 * Response body of `POST /api/account/login`: the issued learner Access Token,
 * its lifetime in seconds (Req 6.5), and the resolved name/email so the account
 * page can display the signed-in identity.
 */
export interface AccountLoginResponse {
  accessToken: string;
  expiresInSeconds: number;
  name: string;
  email: string;
}

/**
 * Value returned by {@link useAccount}. Exposes the current sign-in state and
 * the email-only `login`/`logout` operations. `login` persists the issued
 * learner Access Token (shared with the Download Gate identity); `logout`
 * discards it (Req 6.4, 6.5, 6.7).
 */
export interface UseAccountResult {
  /** The signed-in learner's display name, or `null` when signed out. */
  name: string | null;
  /** The signed-in learner's email, or `null` when signed out. */
  email: string | null;
  /** `true` when a valid learner Access Token is present. */
  isLoggedIn: boolean;
  /** `true` while a sign-in request is in flight (Req 7.3). */
  isLoading: boolean;
  /** The most recent sign-in failure, or `null` when none (Req 8.1). */
  error: HttpError | null;
  /**
   * Sign in with a name + email: persists a User Record (or reuses an existing
   * one, refreshing its name) and stores the issued Access Token. Resolves
   * `true` on success so the caller can react (Req 6.2–6.5).
   */
  login: (name: string, email: string) => Promise<boolean>;
  /** Sign out by discarding the stored Access Token (Req 6.7). */
  logout: () => void;
}
