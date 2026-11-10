// Constants for the Carousel component.

/** How long each slide is held before sliding to the next one. */
export const CAROUSEL_HOLD_MS = 2000;

/**
 * When the next slide is committed after the slide animation starts. Must be
 * at least the SCSS `$change-time` (1s); the animation holds its end frame
 * (`forwards`), so the small margin never shows a jump.
 */
export const CAROUSEL_COMMIT_MS = 1050;

/** Users who ask for reduced motion see the first slide only (no autoplay). */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
