'use client';

// ToastProvider — owns the toast queue and renders the fixed viewport.
//
// Responsibilities:
//   - Expose `showToast`/`dismissToast` through React context (the `useToast`
//     hook) so components can raise toasts directly.
//   - Subscribe to the global toast bus for the app's lifetime so any failed
//     API call (emitted by the shared `httpRequest` wrapper) surfaces a toast
//     without each call site wiring one up.
//   - Auto-dismiss each toast after `TOAST_AUTO_DISMISS_MS`, clearing pending
//     timers on unmount so no state update fires after teardown.
//
// All styling lives in `Toast.module.scss` (no inline CSS).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { subscribeToast } from '@/utils/toastBus';

import styles from './Toast.module.scss';
import {
  TOAST_AUTO_DISMISS_MS,
  TOAST_DEFAULT_VARIANT,
  TOAST_DISMISS_LABEL,
  TOAST_REGION_LABEL,
  TOAST_VARIANT_LABELS,
} from './Toast.constant';
import type {
  ToastContextValue,
  ToastItem,
  ToastProviderProps,
  ToastVariant,
} from './Toast.types';

/** Map each variant to its style-module class for the toast card. */
const VARIANT_CLASS: Record<ToastVariant, string> = {
  info: styles.info,
  error: styles.error,
  warning: styles.warning,
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Access the toast API. Must be called within a {@link ToastProvider}; throws
 * otherwise so a missing provider is caught early in development.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
}

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Monotonic id source and the set of pending auto-dismiss timers, so we can
  // clear them on unmount and avoid a state update after teardown.
  const nextIdRef = useRef<number>(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismissToast = useCallback((id: number): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = TOAST_DEFAULT_VARIANT): void => {
      // Ignore empty messages so a producer cannot raise a blank toast.
      if (message.trim().length === 0) {
        return;
      }
      const id = nextIdRef.current;
      nextIdRef.current += 1;

      setToasts((current) => [...current, { id, message, variant }]);

      const timer = setTimeout(() => {
        dismissToast(id);
      }, TOAST_AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  // Bridge the global toast bus (used by non-React producers like `httpRequest`)
  // into the provider for the app's lifetime.
  useEffect(() => {
    const unsubscribe = subscribeToast((payload) => {
      showToast(payload.message, payload.variant ?? TOAST_DEFAULT_VARIANT);
    });
    return unsubscribe;
  }, [showToast]);

  // Clear any pending timers when the provider unmounts.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        className={styles.viewport}
        role="region"
        aria-label={TOAST_REGION_LABEL}
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${VARIANT_CLASS[toast.variant]}`}
            role="alert"
          >
            <span className={styles.badge}>
              <span className={styles.dot} aria-hidden="true" />
              {TOAST_VARIANT_LABELS[toast.variant]}
            </span>
            <span className={styles.message}>{toast.message}</span>
            <button
              type="button"
              className={styles.dismiss}
              aria-label={TOAST_DISMISS_LABEL}
              onClick={() => dismissToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
