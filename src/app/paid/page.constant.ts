// Constant values for the Paid Materials Tab page (Requirements 12.1, 12.2,
// 12.3, 12.5, 1.16, 1.17).
//
// The Paid Materials Tab lists Paid Materials with their Price/Currency and
// drives the buy (Razorpay Checkout) / view-download flow. These literals are
// defined here so the page module stays free of constant-literal exports
// (Req 1.16, 1.17).

/** Page heading and supporting copy (Req 12.1). */
export const PAID_PAGE_TITLE = "Paid materials";
export const PAID_PAGE_SUBTITLE =
  "Browse premium government exam materials. Buy once to view and download anytime.";

/** Accessible label for the rendered Paid Materials listing region. */
export const PAID_RESULTS_LABEL = "Paid materials";

/** Loading affordance shown while the Paid Materials listing is fetched (Req 7.3). */
export const PAID_LOADING_LABEL = "Loading paid materials…";

/** Error copy shown when the listing request fails or times out (Req 8.1, 8.2). */
export const PAID_ERROR_TITLE = "Paid materials unavailable";
export const PAID_ERROR_MESSAGE =
  "The paid materials could not be loaded. Please try again.";

/** Empty-state copy shown when no Paid Materials are available (Req 12.1). */
export const PAID_EMPTY_TITLE = "No paid materials yet";
export const PAID_EMPTY_MESSAGE =
  "There are no paid materials available right now. Please check back later.";

/** Title shown on the payment failure banner surfaced after a failed Payment (Req 12.7). */
export const PAYMENT_FAILED_TITLE = "Payment not completed";

/**
 * Confirmation banner copy shown once a Payment succeeds and a Payment
 * Entitlement is granted, inviting the Learner to view/download (Req 12.2, 12.6).
 */
export const PAYMENT_SUCCESS_MESSAGE =
  "Payment successful. You can now view and download this material.";
