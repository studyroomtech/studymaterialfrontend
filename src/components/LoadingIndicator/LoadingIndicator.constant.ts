// Constant values for the LoadingIndicator component (Requirements 1.16, 1.17).
//
// The LoadingIndicator surfaces the >= 500 ms / pending-request state driven by
// the API hooks (Req 7.3, 5.2).

/** Default accessible label announced while a request is in flight. */
export const DEFAULT_LOADING_LABEL = "Loading…";

/** Supported visual sizes for the spinner. */
export const LOADING_INDICATOR_SIZES = ["sm", "md", "lg"] as const;

/** Default spinner size when none is supplied. */
export const DEFAULT_LOADING_INDICATOR_SIZE = "md";
