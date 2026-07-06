// Constant values for the ErrorMessage component (Requirements 1.16, 1.17).
//
// ErrorMessage reports a failed/timed-out request without wiping the
// surrounding view (Req 7.4, 8.1, 8.2, 3.9, 5.5).

/** Default heading shown when no title is supplied. */
export const DEFAULT_ERROR_TITLE = "Something went wrong";

/** Default body message shown when no message is supplied. */
export const DEFAULT_ERROR_MESSAGE =
  "The request could not be completed. Please try again.";

/** Default label for the retry action button. */
export const DEFAULT_RETRY_LABEL = "Try again";
