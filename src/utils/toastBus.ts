// Global toast bus — a tiny module-level pub/sub.
//
// This decouples non-React producers (notably the shared `httpRequest` wrapper,
// which is a plain function and cannot call a hook) from the React
// `ToastProvider` that renders toasts. Producers call `emitToast`; the provider
// subscribes once for the app's lifetime via `subscribeToast` and renders every
// emitted payload. Any failed API call can therefore surface a toast without
// each call site wiring one up.

import type { ToastListener, ToastPayload } from './toastBus.types';

// The set of active subscribers. In practice this is the single ToastProvider
// mounted at the app root, but a Set keeps the contract robust if more than one
// ever subscribes (e.g. during a hot reload).
const listeners = new Set<ToastListener>();

/**
 * Subscribe to toast emissions. Returns an unsubscribe function to call on
 * cleanup so a re-mounted provider does not leak listeners.
 */
export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Emit a toast to every current subscriber. A no-op when nothing is subscribed
 * (e.g. during server-side rendering), so producers can call it unconditionally.
 */
export function emitToast(payload: ToastPayload): void {
  listeners.forEach((listener) => {
    listener(payload);
  });
}
