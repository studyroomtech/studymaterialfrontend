// Constants for the shopping-cart hook (`useCart.ts`).

/** `localStorage` key under which the learner's cart is persisted. */
export const CART_STORAGE_KEY = 'sm.cart';

/**
 * Custom window event dispatched whenever the cart changes, so every mounted
 * `useCart` instance (nav badge, cart page, buttons) stays in sync within the
 * same tab. Cross-tab sync is handled via the native `storage` event.
 */
export const CART_CHANGED_EVENT = 'sm:cart-changed';
