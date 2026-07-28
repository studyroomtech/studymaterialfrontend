// Constant values for the global application context.
//
// The screen breakpoints mirror the SCSS `$breakpoints` (`md: 768`, `lg: 1024`)
// so the JS-side responsive flags agree with the stylesheet's media queries.

/**
 * Viewport-width thresholds (CSS px) that classify the named breakpoints:
 *   - `width <  tablet`  -> mobile
 *   - `tablet <= width < desktop` -> tablet
 *   - `width >= desktop` -> desktop
 */
export const SCREEN_BREAKPOINTS = {
  /** At/above this width the layout is at least a tablet (matches SCSS `md`). */
  tablet: 768,
  /** At/above this width the layout is a desktop (matches SCSS `lg`). */
  desktop: 1024,
} as const;

/** SSR default viewport width used before the client can measure `window`. */
export const DEFAULT_SCREEN_WIDTH = 1024;

/** SSR default viewport height used before the client can measure `window`. */
export const DEFAULT_SCREEN_HEIGHT = 768;

/** SSR default viewport width when the request UA is detected as mobile. */
export const DEFAULT_MOBILE_SCREEN_WIDTH = 390;

/** SSR default viewport height when the request UA is detected as mobile. */
export const DEFAULT_MOBILE_SCREEN_HEIGHT = 844;
