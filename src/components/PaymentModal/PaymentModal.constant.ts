// Constant values for the PaymentModal component (Requirements 1.16, 12.5).
//
// The PaymentModal launches Razorpay Checkout using the order details returned
// by the Backend API and the public `NEXT_PUBLIC_RAZORPAY_KEY_ID`.

/** URL of the Razorpay Checkout script loaded dynamically at launch. */
export const RAZORPAY_CHECKOUT_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

/** Id assigned to the injected script tag so it is loaded at most once. */
export const RAZORPAY_SCRIPT_ELEMENT_ID = "razorpay-checkout-js";

/** The Razorpay Checkout event emitted when a payment attempt fails. */
export const RAZORPAY_PAYMENT_FAILED_EVENT = "payment.failed";

/** Merchant name shown in the Razorpay Checkout header. */
export const CHECKOUT_NAME = "StudyForGovt";

/** Fallback checkout description when no material title is supplied. */
export const DEFAULT_CHECKOUT_DESCRIPTION = "Study Material purchase";

/**
 * Checkout accent color. Mirrors the shared theme's primary color so the
 * gateway matches the platform palette (kept in sync with `$colors.primary`).
 */
export const CHECKOUT_THEME_COLOR = "#2563eb";

/** Stable ids associating the dialog with its title/description for AT. */
export const DIALOG_TITLE_ID = "payment-modal-title";
export const DIALOG_DESCRIPTION_ID = "payment-modal-description";

/** Heading and supporting copy shown while checkout is being prepared. */
export const DIALOG_TITLE = "Redirecting to secure checkout";
export const DIALOG_DESCRIPTION =
  "You're being taken to Razorpay to complete your payment securely.";

/** Loading affordance label announced while the gateway is opening. */
export const LOADING_LABEL = "Opening secure checkout";

/** Error title shown when checkout cannot be launched. */
export const ERROR_TITLE = "Payment unavailable";

/**
 * Error message shown when the public Razorpay key is missing, so no order can
 * be presented (the secret key is never exposed to the client — Req 12.17).
 */
export const MISSING_KEY_ERROR =
  "Payment is unavailable right now. Please try again later.";

/** Error message shown when the Razorpay Checkout script fails to load. */
export const SCRIPT_LOAD_ERROR =
  "Could not load the payment gateway. Please check your connection and try again.";

/** Label for the dismiss/cancel action on the preparing/error states. */
export const CANCEL_LABEL = "Cancel";
