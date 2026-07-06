// Constants for the pure price utility (`price.ts`).
//
// Centralizes the default Currency, the paid-Price bounds, and the display
// symbols/labels so the price classification and formatting helpers share a
// single source of truth. These mirror the Backend Project's price rules
// (see backend `constants/payment.constant.ts`); the Backend API remains the
// authority and re-validates every Price.
//
// References:
//   - Req 12.1:  the Paid Materials Tab displays each Paid Material's Price
//     amount and Currency.
//   - Req 11.13: a Price with an amount in 1..1,000,000 and Currency INR marks
//     a Study Material as a Paid Material.
//   - Req 11.14: no Price or a Price amount of 0 marks a Study Material Free.

// The default (and, for this iteration, only supported) Currency for Prices and
// Payments (INR for Razorpay) (Req 12.1, Req 11.13).
export const DEFAULT_CURRENCY = 'INR';

// Inclusive bounds for a Paid Material's Price amount (Req 11.13). An amount
// within these bounds classifies the material as Paid; an amount of 0 (or no
// Price) classifies it as Free (Req 11.14).
export const MIN_PAID_AMOUNT = 1;
export const MAX_PAID_AMOUNT = 1000000;

// The two possible Price classifications for a Study Material (Req 11.13, 11.14).
export const PRICE_CLASSIFICATION = {
  paid: 'paid',
  free: 'free',
} as const;

// User-facing label shown in place of a formatted amount for a Free Material
// (Req 11.14).
export const FREE_PRICE_LABEL = 'Free';

// Display symbols keyed by Currency code, used by the formatting helpers when a
// currency symbol is preferred over the ISO code.
export const CURRENCY_SYMBOLS = {
  INR: '₹',
} as const;

// BCP 47 locales used to format an amount for a given Currency with correct
// digit grouping (e.g., the Indian numbering system for INR).
export const CURRENCY_LOCALES = {
  INR: 'en-IN',
} as const;

// Fallback locale used when a Currency has no explicit locale mapping.
export const DEFAULT_PRICE_LOCALE = 'en-IN';
