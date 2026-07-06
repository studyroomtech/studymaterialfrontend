// Type declarations for the learner Access Token hook (Req 6.6, 6.7).

/**
 * The decoded payload of a learner JWT Access Token. Only the standard `exp`
 * claim (expiry, in seconds since the Unix epoch) is required by the frontend
 * to determine whether the Download Gate must be shown again.
 */
export interface DecodedAccessToken {
  /** Expiry time in seconds since the Unix epoch, per the JWT `exp` claim. */
  exp?: number;
  /** The resolved learner email, per the token's `email` claim (Req 6.5). */
  email?: string;
  /** The learner's display name, per the token's optional `name` claim (Req 6.2). */
  name?: string;
  /** The Roles held by the signed-in user, per the token's `roles` claim (Req 10.1). */
  roles?: string[];
  [claim: string]: unknown;
}

/**
 * Value returned by {@link useAccessToken}. Exposes the current learner Access
 * Token together with helpers to set/clear it and flags describing whether a
 * valid token is present or the Download Gate must be shown again (Req 6.6, 6.7).
 */
export interface UseAccessTokenResult {
  /** The persisted learner Access Token, or `null` when none is stored. */
  token: string | null;
  /**
   * The signed-in learner's email, decoded from a valid token's `email` claim,
   * or `null` when there is no valid token. Lets the UI display the current
   * identity without a network round-trip (Req 6.5, 6.6).
   */
  email: string | null;
  /**
   * The signed-in learner's display name, decoded from a valid token's optional
   * `name` claim, or `null` when absent. Lets the UI greet the learner by name
   * after a reload without a network round-trip (Req 6.2, 6.5).
   */
  name: string | null;
  /**
   * The Roles held by the signed-in learner, decoded from a valid token's
   * `roles` claim (empty when none/signed out). Drives role-aware UI (Req 10.1).
   */
  roles: string[];
  /**
   * `true` when a valid token is present and its `roles` include `role_admin`,
   * so the UI can surface Content Management options without a separate admin
   * login (Req 10.1, 10.4).
   */
  isAdmin: boolean;
  /**
   * `true` when there is no token, or the stored token is expired or cannot be
   * decoded (i.e. invalid). Such a token signals the Download Gate (Req 6.7).
   */
  isExpired: boolean;
  /** `true` only when a token is present and not expired/invalid (Req 6.6). */
  hasValidToken: boolean;
  /**
   * `true` when the Download Gate must be displayed to (re)collect the learner's
   * name and email — i.e. no valid Access Token is present (Req 6.7).
   */
  mustShowGate: boolean;
  /** Persist a newly issued Access Token and update the hook state. */
  setToken: (token: string) => void;
  /** Remove any stored Access Token and update the hook state. */
  clearToken: () => void;
}

/**
 * Signature of the {@link useDebounce} hook: returns a debounced copy of the
 * provided value that only updates after the value stops changing for the
 * given delay (Req 4.1).
 */
export type UseDebounce = <TValue>(value: TValue, delayMs?: number) => TValue;
