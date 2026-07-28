'use client';

// GlobalProvider — the app-wide context holding the two cross-cutting slices
// every screen needs: the signed-in Learner's identity (`user`) and the live
// viewport state (`screen`).
//
// Responsibilities:
//   - Derive `user` from `useAccessToken` so any component can read the current
//     identity (email/name/roles/admin) without re-decoding the token.
//   - Measure the viewport on mount and on every resize, exposing width/height
//     plus the derived responsive flags (mobile/tablet/desktop, orientation).
//   - Seed the pre-hydration `screen` from the server's User-Agent mobile hint
//     (passed by the root layout) so the first client render matches the server
//     render, then replace it with a real measurement on mount.
//
// Consumers read the context through the `useGlobalContext` hook.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAccessToken } from '@/hooks/useAccessToken';

import {
  DEFAULT_MOBILE_SCREEN_HEIGHT,
  DEFAULT_MOBILE_SCREEN_WIDTH,
  DEFAULT_SCREEN_HEIGHT,
  DEFAULT_SCREEN_WIDTH,
  SCREEN_BREAKPOINTS,
} from './provider.constant';
import type {
  GlobalContextValue,
  GlobalProviderProps,
  ScreenDetails,
} from './provider.types';

const GlobalContext = createContext<GlobalContextValue | null>(null);

/**
 * Access the global context. Must be called within a {@link GlobalProvider};
 * throws otherwise so a missing provider is caught early in development.
 */
export function useGlobalContext(): GlobalContextValue {
  const context = useContext(GlobalContext);
  if (context === null) {
    throw new Error('useGlobalContext must be used within a GlobalProvider.');
  }
  return context;
}

/**
 * Classify a viewport size into the {@link ScreenDetails} shape, deriving the
 * responsive flags and orientation from the width/height and the shared
 * breakpoints.
 */
function resolveScreen(width: number, height: number): ScreenDetails {
  const isMobile = width < SCREEN_BREAKPOINTS.tablet;
  const isDesktop = width >= SCREEN_BREAKPOINTS.desktop;
  const isTablet = !isMobile && !isDesktop;
  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    orientation: height >= width ? 'portrait' : 'landscape',
  };
}

/**
 * Build the pre-hydration screen state from the server's mobile hint, so the
 * first client render agrees with the server-rendered HTML before `window` can
 * be measured.
 */
function initialScreen(initialIsMobile: boolean): ScreenDetails {
  return initialIsMobile
    ? resolveScreen(DEFAULT_MOBILE_SCREEN_WIDTH, DEFAULT_MOBILE_SCREEN_HEIGHT)
    : resolveScreen(DEFAULT_SCREEN_WIDTH, DEFAULT_SCREEN_HEIGHT);
}

function GlobalProvider({
  children,
  initialIsMobile = false,
}: GlobalProviderProps) {
  const { hasValidToken, email, name, roles, isAdmin } = useAccessToken();

  // The identity slice mirrors the Access Token claims resolved by
  // `useAccessToken`; when no valid token is held it reads as anonymous.
  const user = useMemo(
    () => ({
      isAuthenticated: hasValidToken,
      email,
      name,
      roles,
      isAdmin,
    }),
    [hasValidToken, email, name, roles, isAdmin],
  );

  const [screen, setScreen] = useState<ScreenDetails>(() =>
    initialScreen(initialIsMobile),
  );

  // Measure the real viewport on mount and keep it in sync on resize. The
  // listener is torn down on unmount so no update fires after teardown.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const measure = (): void => {
      setScreen(resolveScreen(window.innerWidth, window.innerHeight));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
    };
  }, []);

  const value = useMemo<GlobalContextValue>(
    () => ({ user, screen }),
    [user, screen],
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

export default GlobalProvider;
