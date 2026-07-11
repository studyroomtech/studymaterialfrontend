// Types for the global toast bus (`toastBus.ts`).
//
// The bus is a tiny module-level pub/sub that decouples non-React code (the
// shared `httpRequest` wrapper) from the React `ToastProvider`. `httpRequest`
// emits a payload on any API failure and the provider — subscribed for the
// lifetime of the app — renders it as a toast. Keeping the contract here (not
// in the module) follows the type-declaration file-split convention.

/** The visual category of a toast. */
export type ToastVariant = 'error' | 'success' | 'info';

/** A toast to display, emitted onto the bus by any producer. */
export interface ToastPayload {
  /** The user-facing message to show. */
  message: string;
  /** The visual category; defaults to `error` when omitted. */
  variant?: ToastVariant;
}

/** A subscriber notified whenever a toast is emitted. */
export type ToastListener = (payload: ToastPayload) => void;
