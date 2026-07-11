// Constant values for the Toast system.

/** How long (ms) a toast stays visible before it auto-dismisses. */
export const TOAST_AUTO_DISMISS_MS = 5000;

/** The visual categories a toast can take. */
export const TOAST_VARIANT = {
  error: 'error',
  success: 'success',
  info: 'info',
} as const;

/** The default variant applied when a caller does not specify one. */
export const TOAST_DEFAULT_VARIANT = TOAST_VARIANT.error;

/** Accessible label for the region that groups the toasts. */
export const TOAST_REGION_LABEL = 'Notifications';

/** Accessible label for a toast's dismiss button. */
export const TOAST_DISMISS_LABEL = 'Dismiss notification';
