'use client';

// Learner Access Token hook.
//
// Reads/writes the learner's JWT Access Token from browser `localStorage` and
// detects expiry (via the JWT `exp` claim) so that an expired, invalid, or
// absent token re-triggers the Download Gate (Req 6.6, 6.7). All storage access
// is guarded against server-side rendering (no `window`).

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS,
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_STORAGE_KEY,
  ROLE_ADMIN,
} from './useAccessToken.constant';
import type {
  DecodedAccessToken,
  UseAccessTokenResult,
} from './useAccessToken.types';

/** Whether a browser environment (with `window`) is available. */
const isBrowser = (): boolean => typeof window !== 'undefined';

/** Mirror the Access Token to a cookie so it is also available as a cookie. */
const writeTokenCookie = (token: string): void => {
  if (!isBrowser() || typeof document === 'undefined') {
    return;
  }
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; Path=/; Max-Age=${ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
};

/** Remove the Access Token cookie (on sign-out / expiry). */
const clearTokenCookie = (): void => {
  if (!isBrowser() || typeof document === 'undefined') {
    return;
  }
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
};

/** Read the Access Token from the cookie, or `null` when absent. */
const readTokenCookie = (): string | null => {
  if (!isBrowser() || typeof document === 'undefined') {
    return null;
  }
  const prefix = `${ACCESS_TOKEN_COOKIE_NAME}=`;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(prefix));
  if (match === undefined) {
    return null;
  }
  const value = match.slice(prefix.length);
  return value.length > 0 ? decodeURIComponent(value) : null;
};

/**
 * Safely read the persisted Access Token, returning `null` on SSR or error.
 * Prefers `localStorage`, then falls back to the cookie so a token set as a
 * cookie (by the app or manually) is also honored.
 */
const readStoredToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (stored !== null && stored.length > 0) {
      return stored;
    }
  } catch {
    // Ignore storage failures (e.g. private mode) and fall back to the cookie.
  }
  return readTokenCookie();
};

/** Decode a base64url string to its UTF-8 representation, or `null` on error. */
const decodeBase64Url = (segment: string): string | null => {
  if (!isBrowser() || typeof window.atob !== 'function') {
    return null;
  }
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const remainder = normalized.length % 4;
    const padded =
      remainder === 0
        ? normalized
        : normalized.padEnd(normalized.length + (4 - remainder), '=');
    return window.atob(padded);
  } catch {
    return null;
  }
};

/** Decode the payload of a JWT Access Token, or `null` when it is malformed. */
const decodeAccessToken = (token: string): DecodedAccessToken | null => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  const payloadJson = decodeBase64Url(parts[1]);
  if (payloadJson === null) {
    return null;
  }
  try {
    return JSON.parse(payloadJson) as DecodedAccessToken;
  } catch {
    return null;
  }
};

/** Resolve the token expiry in milliseconds, or `null` when undeterminable. */
const getExpiryMs = (token: string | null): number | null => {
  if (!token) {
    return null;
  }
  const decoded = decodeAccessToken(token);
  if (!decoded || typeof decoded.exp !== 'number') {
    return null;
  }
  return decoded.exp * 1000;
};

/**
 * A token counts as expired/invalid — and therefore requires the Download Gate
 * (Req 6.7) — when it is absent, its expiry cannot be determined (malformed),
 * or the current time is at/after its expiry.
 */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }
  const expiryMs = getExpiryMs(token);
  if (expiryMs === null) {
    return true;
  }
  return Date.now() >= expiryMs;
};

export const useAccessToken = (): UseAccessTokenResult => {
  const [token, setTokenState] = useState<string | null>(() =>
    readStoredToken(),
  );
  // `checkedAt` is bumped whenever expiry must be re-evaluated (on mount, on a
  // scheduled expiry timer, or on cross-tab storage changes) so that derived
  // flags recompute and the Download Gate re-triggers as needed (Req 6.7).
  const [checkedAt, setCheckedAt] = useState<number>(() => Date.now());

  // Re-sync from storage after hydration (initial SSR render yields `null`).
  useEffect(() => {
    setTokenState(readStoredToken());
    setCheckedAt(Date.now());
  }, []);

  // Keep the hook in sync when the token changes in another browser tab.
  useEffect(() => {
    if (!isBrowser()) {
      return undefined;
    }
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === ACCESS_TOKEN_STORAGE_KEY) {
        setTokenState(readStoredToken());
        setCheckedAt(Date.now());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Schedule a re-check exactly when the current token expires so the Download
  // Gate re-triggers automatically while the page stays open (Req 6.7).
  useEffect(() => {
    if (!isBrowser()) {
      return undefined;
    }
    const expiryMs = getExpiryMs(token);
    if (expiryMs === null) {
      return undefined;
    }
    const delay = expiryMs - Date.now();
    if (delay <= 0) {
      setCheckedAt(Date.now());
      return undefined;
    }
    const timer = window.setTimeout(() => setCheckedAt(Date.now()), delay);
    return () => window.clearTimeout(timer);
  }, [token]);

  const setToken = useCallback((next: string): void => {
    if (isBrowser()) {
      try {
        window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, next);
      } catch {
        // Ignore storage failures (e.g. private mode); state still updates.
      }
    }
    // Mirror the token to a cookie so it is also persisted there.
    writeTokenCookie(next);
    setTokenState(next);
    setCheckedAt(Date.now());
  }, []);

  const clearToken = useCallback((): void => {
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      } catch {
        // Ignore storage failures; state still updates.
      }
    }
    clearTokenCookie();
    setTokenState(null);
    setCheckedAt(Date.now());
  }, []);

  const isExpired = useMemo(
    // `checkedAt` participates so expiry is re-evaluated when it changes.
    () => isTokenExpired(token),
    [token, checkedAt],
  );
  const hasValidToken = token !== null && !isExpired;
  const mustShowGate = !hasValidToken;

  // Expose the signed-in email/name/roles from a valid token's claims so the UI
  // can display the current identity and role-aware options without calling the
  // Backend API (Req 6.2, 6.5, 10.1).
  const { email, name, roles } = useMemo(() => {
    if (!hasValidToken || token === null) {
      return { email: null, name: null, roles: [] as string[] };
    }
    const decoded = decodeAccessToken(token);
    return {
      email: typeof decoded?.email === 'string' ? decoded.email : null,
      name: typeof decoded?.name === 'string' ? decoded.name : null,
      roles: Array.isArray(decoded?.roles)
        ? decoded.roles.filter((role): role is string => typeof role === 'string')
        : [],
    };
  }, [token, hasValidToken]);

  const isAdmin = roles.includes(ROLE_ADMIN);

  return {
    token,
    email,
    name,
    roles,
    isAdmin,
    isExpired,
    hasValidToken,
    mustShowGate,
    setToken,
    clearToken,
  };
};
