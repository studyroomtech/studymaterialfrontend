'use client';

// `useCart` — a client-side shopping cart persisted in `localStorage`.
//
// The cart holds Paid Materials the Learner intends to buy together. It is
// intentionally client-only (no backend cart table): checkout hands the item
// ids to the payment flow, which creates one Razorpay order for the whole cart.
//
// Every mutation writes storage and dispatches a custom window event so all
// mounted instances (nav badge, cart page, add-to-cart buttons) re-read and
// stay in sync within the tab; the native `storage` event keeps other tabs in
// sync. Storage is read from as the source of truth on each mutation to avoid
// stale-closure bugs. All access is guarded against SSR (no `window`).

import { useCallback, useEffect, useMemo, useState } from 'react';

import { CART_CHANGED_EVENT, CART_STORAGE_KEY } from './useCart.constant';
import type { CartItem, UseCartResult } from './useCart.types';

/** Whether a browser environment (with `window`) is available. */
const isBrowser = (): boolean => typeof window !== 'undefined';

/** Read and validate the persisted cart, returning `[]` on SSR or any error. */
function readCart(): CartItem[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry): entry is CartItem =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as CartItem).id === 'string' &&
        typeof (entry as CartItem).title === 'string' &&
        typeof (entry as CartItem).priceAmount === 'number',
    );
  } catch {
    return [];
  }
}

/** Persist the cart and notify every mounted instance to re-sync. */
function writeCart(items: CartItem[]): void {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage failures (e.g. private mode); the event still fires.
  }
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}

export const useCart = (): UseCartResult => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  // Load the cart from storage after mount (SSR renders an empty cart, so this
  // avoids a hydration mismatch), then keep it synced with same-tab custom
  // events and cross-tab storage events.
  useEffect(() => {
    setItems(readCart());
    setHasMounted(true);

    const sync = (): void => setItems(readCart());
    const onStorage = (event: StorageEvent): void => {
      if (event.key === CART_STORAGE_KEY) {
        sync();
      }
    };
    window.addEventListener(CART_CHANGED_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const addItem = useCallback((item: CartItem): void => {
    const current = readCart();
    if (current.some((entry) => entry.id === item.id)) {
      return;
    }
    writeCart([...current, item]);
  }, []);

  const removeItem = useCallback((id: string): void => {
    writeCart(readCart().filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback((): void => {
    writeCart([]);
  }, []);

  const has = useCallback(
    (id: string): boolean => items.some((entry) => entry.id === id),
    [items],
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, entry) => sum + entry.priceAmount, 0),
    [items],
  );

  return {
    items,
    count: items.length,
    totalAmount,
    hasMounted,
    addItem,
    removeItem,
    clear,
    has,
  };
};
