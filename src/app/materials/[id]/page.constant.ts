// Constant values for the Study Material view page (Requirements 1.16, 1.17).
//
// The view page requests and displays a single Study Material's content, driving
// a loading indicator while it loads (Req 5.1, 5.2) and an error message when the
// request fails or times out without showing partial content (Req 5.5).

/** Label for the link back to the Material Catalog. */
export const BACK_TO_CATALOG_LABEL = "← Back to catalog";

/** Href of the Material Catalog (home) page. */
export const CATALOG_HREF = "/";

/** Accessible label announced while the material is being retrieved (Req 5.2). */
export const LOADING_LABEL = "Loading exam material…";

/** Heading for the material description section. */
export const DESCRIPTION_HEADING = "Description";

/** Fallback text shown when a material has no description. */
export const NO_DESCRIPTION_TEXT = "No description provided.";

/** Label for the download action button. */
export const DOWNLOAD_LABEL = "Download";

/** Heading for the material's files list section. */
export const FILES_HEADING = "Files";

/** Title shown above the load-failure error message (Req 5.5). */
export const LOAD_ERROR_TITLE = "Exam material unavailable";

/**
 * Message shown when the material request fails/errors without a more specific
 * cause, indicating the material could not be loaded (Req 5.5).
 */
export const LOAD_ERROR_MESSAGE =
  "The exam material could not be loaded. Please try again.";

/** Message shown when the material request does not respond within 5s (Req 5.5). */
export const TIMEOUT_ERROR_MESSAGE =
  "The exam material took too long to load. Please try again.";

/** Message shown when the requested Study Material does not exist (Req 5.4). */
export const NOT_FOUND_ERROR_MESSAGE =
  "The requested exam material could not be found.";

/** Message shown when no material identifier is present in the route. */
export const INVALID_ID_MESSAGE = "No exam material was specified.";

/** Title shown above a failed download's error message (Req 8.1). */
export const DOWNLOAD_ERROR_TITLE = "Download failed";

/** HTTP status returned by the Backend API when a material does not exist (Req 5.4). */
export const NOT_FOUND_STATUS = 404;

/**
 * HTTP status returned by `GET /api/materials/:id` for a Paid Material the
 * Learner is not entitled to; no content is delivered and payment is prompted
 * (Req 12.3).
 */
export const PAYMENT_REQUIRED_STATUS = 403;

/**
 * Backend API error code accompanying a {@link PAYMENT_REQUIRED_STATUS}
 * response, identifying the Paid-Material entitlement gate (Req 12.3).
 */
export const PAYMENT_REQUIRED_CODE = "PAYMENT_REQUIRED";

/** Error-kind discriminant identifying a request timeout (Req 5.5, 8.2). */
export const TIMEOUT_ERROR_KIND = "timeout";

/** Heading for the entitlement gate shown for a locked Paid Material (Req 12.3). */
export const LOCKED_TITLE = "This is a paid exam material";

/** Explanatory copy shown beneath the locked-material heading (Req 12.3). */
export const LOCKED_MESSAGE =
  "Complete a one-time payment to unlock this exam material. Your access is saved so you can view and download it again later.";

/**
 * Heading shown when the material is unlocked by purchasing a *linked* paid
 * material rather than paying for this one directly
 * (linked-material-entitlement).
 */
export const LOCKED_LINKED_TITLE = "This material is unlocked by a linked purchase";

/** Explanatory copy shown when the material is unlocked via a linked paid note. */
export const LOCKED_LINKED_MESSAGE =
  "This material is part of a bundle. Purchase any of the linked paid materials below to unlock it — your access is then saved so you can view and download it again later.";

/** Label prefacing the list of purchasable linked materials. */
export const UNLOCK_OPTIONS_LABEL = "Buy a linked material to unlock";

/** Accessible label announced while the unlock options are being resolved. */
export const UNLOCK_OPTIONS_LOADING_LABEL = "Loading unlock options…";

/** Prefix label shown before the formatted Price on the locked panel (Req 12.1). */
export const PRICE_LABEL = "Price";

/** Label for the pay call-to-action that starts the Razorpay payment (Req 12.3, 12.5). */
export const PAY_ACTION_LABEL = "Pay to unlock";

/** Label for adding the locked Paid Material to the cart. */
export const ADD_TO_CART_LABEL = "Add to cart";

/** Label shown when the Paid Material is already in the cart. */
export const IN_CART_LABEL = "In cart";

/** Accessible label announced while the Paid Material's Price is being resolved. */
export const PRICE_LOADING_LABEL = "Loading price…";

/** Title shown above a failed payment's message on the locked panel (Req 12.7). */
export const PAYMENT_FAILED_TITLE = "Payment not completed";

/** Fallback message shown when a payment fails without a more specific reason (Req 12.7). */
export const PAYMENT_FAILED_MESSAGE =
  "The payment could not be completed. Please try again.";
