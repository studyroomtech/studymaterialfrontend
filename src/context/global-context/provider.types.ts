// Type declarations for the global application context (provider + hook).
//
// The global context exposes two slices to the whole app: `user` (the
// signed-in Learner's identity, derived from the Access Token) and `screen`
// (the current viewport size and derived responsive flags). All type/interface
// declarations live here so the provider module stays free of declarations
// (Req 1.15, 1.17).

import type { ReactNode } from 'react';

/**
 * The signed-in Learner's identity, derived from the Access Token claims. When
 * no valid token is held every field is empty/false so consumers can treat the
 * caller as anonymous.
 */
export interface UserDetails {
  /** Whether a valid (non-expired) Access Token is currently held. */
  isAuthenticated: boolean;
  /** The Learner's email, or `null` when unauthenticated. */
  email: string | null;
  /** The Learner's display name, or `null` when unauthenticated. */
  name: string | null;
  /** The roles carried by the token (e.g. `role_admin`), or `[]` when none. */
  roles: string[];
  /** Convenience flag: whether the caller holds the admin role. */
  isAdmin: boolean;
}

/** The named responsive breakpoint the current viewport falls into. */
export type ScreenBreakpoint = 'mobile' | 'tablet' | 'desktop';

/** The current viewport orientation. */
export type ScreenOrientation = 'portrait' | 'landscape';

/**
 * The current viewport size and the responsive flags derived from it. Recomputed
 * on every window resize so consumers always read the live screen state.
 */
export interface ScreenDetails {
  /** Viewport width in CSS pixels. */
  width: number;
  /** Viewport height in CSS pixels. */
  height: number;
  /** `true` when the viewport is below the tablet breakpoint. */
  isMobile: boolean;
  /** `true` when the viewport is between the tablet and desktop breakpoints. */
  isTablet: boolean;
  /** `true` when the viewport is at or above the desktop breakpoint. */
  isDesktop: boolean;
  /** The named breakpoint the viewport falls into. */
  breakpoint: ScreenBreakpoint;
  /** Whether the viewport is taller than it is wide. */
  orientation: ScreenOrientation;
}

/** The value exposed by the global context via `useGlobalContext`. */
export interface GlobalContextValue {
  /** The signed-in Learner's identity slice. */
  user: UserDetails;
  /** The current viewport/screen slice. */
  screen: ScreenDetails;
}

/** Props for the {@link GlobalProvider}. */
export interface GlobalProviderProps {
  /** The subtree that can read the global context. */
  children: ReactNode;
  /**
   * SSR-detected mobile hint from the request User-Agent, used as the
   * pre-hydration default so the first client render matches the server render
   * and avoids a hydration mismatch. Replaced by a real measurement on mount.
   */
  initialIsMobile?: boolean;
}
