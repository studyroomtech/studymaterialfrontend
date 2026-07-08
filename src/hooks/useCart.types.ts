// Type declarations for the shopping-cart hook (`useCart.ts`). All type/
// interface declarations live here so the hook module stays free of them
// (Req 1.15, 1.17).

/**
 * A single item in the cart. Prices are stored in whole rupees (the app's
 * canonical unit); the backend converts to paise at the Razorpay boundary.
 */
export interface CartItem {
  /** The Paid Material id. */
  id: string;
  /** Display title. */
  title: string;
  /** Price amount in whole rupees. */
  priceAmount: number;
  /** Currency code (defaults to INR). */
  currency: string;
}

/** Value returned by {@link useCart}. */
export interface UseCartResult {
  /** The current cart items (empty until mounted on the client). */
  items: CartItem[];
  /** Number of items in the cart. */
  count: number;
  /** Sum of item prices in whole rupees. */
  totalAmount: number;
  /** `true` once the cart has been read from storage after mount (SSR-safe). */
  hasMounted: boolean;
  /** Add an item; a no-op when the material is already in the cart. */
  addItem: (item: CartItem) => void;
  /** Remove the item with the given material id. */
  removeItem: (id: string) => void;
  /** Empty the cart. */
  clear: () => void;
  /** Whether the given material id is already in the cart. */
  has: (id: string) => boolean;
}
