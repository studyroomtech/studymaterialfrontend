// Type declarations for the Toast system (provider, hook, and viewport).
//
// Toasts are transient, auto-dismissing notifications rendered in a fixed
// viewport. The `ToastProvider` owns the queue and exposes `showToast` via
// context (the `useToast` hook); it also subscribes to the global toast bus so
// any failed API call surfaces a toast without each call site wiring one up.

import type { ReactNode } from 'react';

import type { ToastVariant } from '@/utils/toastBus.types';

export type { ToastVariant };

/** A single queued toast rendered in the viewport. */
export interface ToastItem {
  /** Monotonic id used as the React key and for dismissal. */
  id: number;
  /** The user-facing message. */
  message: string;
  /** The visual category driving the toast's styling. */
  variant: ToastVariant;
}

/** The context value exposed by {@link ToastProvider} via `useToast`. */
export interface ToastContextValue {
  /** Show a toast with the given message and optional variant (default error). */
  showToast: (message: string, variant?: ToastVariant) => void;
  /** Dismiss a toast early by id. */
  dismissToast: (id: number) => void;
}

/** Props for {@link ToastProvider}. */
export interface ToastProviderProps {
  /** The subtree that can raise toasts and under which the viewport renders. */
  children: ReactNode;
}
