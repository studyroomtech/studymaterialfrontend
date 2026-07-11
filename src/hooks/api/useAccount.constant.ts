// Constants for the `useAccount` hook (Req 5.1, 5.2, 5.4).

/**
 * Browser `localStorage` key under which the account's tri-state protection
 * status is persisted alongside the learner Access Token.
 *
 * `passwordProtected` is returned **only** on a successful login response and
 * is not a JWT claim, so `useAccessToken` cannot recover it after a reload.
 * Requirement 5 needs three states — unprotected, protected, unknown — so the
 * status is persisted here and read back as a tri-state:
 *   - the marker for an Unprotected Account (last login returned
 *     `passwordProtected === false`) → show the "secure your account" prompt
 *     and the set-password action (Req 5.1, 5.3).
 *   - the marker for a Password-Protected Account (last login returned `true`,
 *     or a set-password just succeeded) → hide the prompt and action (Req 5.4).
 *   - an absent/unrecognized value = unknown (e.g. a reload where only the
 *     token is present) → show nothing (Req 5.2).
 */
export const ACCOUNT_PROTECTION_STORAGE_KEY = 'accountPasswordProtected';

/**
 * Persisted marker values for the tri-state protection status. Only these two
 * literals are stored; any other value (including an absent key) is treated as
 * the "unknown" state that satisfies Req 5.2 by construction.
 */
export const ACCOUNT_PROTECTION_MARKER = {
  /** The last successful sign-in reported an Unprotected Account (Req 5.1). */
  unprotected: 'unprotected',
  /** The account is Password-Protected (Req 5.4). */
  protected: 'protected',
} as const;
