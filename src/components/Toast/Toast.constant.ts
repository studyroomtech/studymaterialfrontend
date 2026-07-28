// Constant values for the Toast system.

/** How long (ms) a toast stays visible before it auto-dismisses. */
export const TOAST_AUTO_DISMISS_MS = 3000;

/** The visual categories a toast can take: info (grey), error (red), warning (yellow). */
export const TOAST_VARIANT = {
  info: 'info',
  error: 'error',
  warning: 'warning',
} as const;

/** The default variant applied when a caller does not specify one. */
export const TOAST_DEFAULT_VARIANT = TOAST_VARIANT.info;

/** The bold label shown in each toast's leading badge, keyed by variant. */
export const TOAST_VARIANT_LABELS = {
  info: 'Info',
  error: 'Error',
  warning: 'Warning',
} as const;

/** Accessible label for the region that groups the toasts. */
export const TOAST_REGION_LABEL = 'Notifications';

/** Accessible label for a toast's dismiss button. */
export const TOAST_DISMISS_LABEL = 'Dismiss notification';
