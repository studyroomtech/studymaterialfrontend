// Constant values for the reusable Button component (Requirements 1.2, 1.16).

import type { ButtonSize, ButtonVariant } from "./Button.types";

/** Default visual variant applied when no `variant` prop is provided. */
export const DEFAULT_BUTTON_VARIANT: ButtonVariant = "primary";

/** Default size step applied when no `size` prop is provided. */
export const DEFAULT_BUTTON_SIZE: ButtonSize = "md";

/**
 * Default native button `type`. Explicitly set to "button" so a Button placed
 * inside a form does not accidentally submit it unless the caller opts in.
 */
export const DEFAULT_BUTTON_TYPE = "button" as const;

/** Accessible label announced while the Button is in its loading state. */
export const BUTTON_LOADING_LABEL = "Loading";
