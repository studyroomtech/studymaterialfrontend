// Constant values for the {@link AttemptRunner} component (task 18.4).
//
// These literals live here so the component module stays free of
// constant-literal exports (mirroring the sibling component convention). They
// cover the loading/failure copy surfaced before an attempt state is available
// and the review-route prefix the runner navigates to on a successful submit.

/** Route prefix of the attempt review page navigated to after submit (Req 14.2). */
export const REVIEW_PATH_PREFIX = '/attempts';

/** Loading copy while the attempt is being started/resumed (Req 7.3). */
export const STARTING_LABEL = 'Preparing your test…';

/** Sign-in-required copy (`AUTH_REQUIRED`, HTTP 401). */
export const AUTH_REQUIRED_TITLE = 'Please sign in';
export const AUTH_REQUIRED_MESSAGE =
  'You need to sign in to start or continue this test.';

/** Payment-required copy (`PAYMENT_REQUIRED`, HTTP 403, Req 8.4). */
export const PAYMENT_REQUIRED_TITLE = 'This test is locked';
export const PAYMENT_REQUIRED_MESSAGE =
  'You do not have access to this test yet. Purchase it to begin your attempt.';

/** Not-found copy (`NOT_FOUND`, HTTP 404, Req 8.6). */
export const NOT_FOUND_TITLE = 'Test not found';
export const NOT_FOUND_MESSAGE =
  'We could not find this test. It may have been removed.';

/** Generic failure copy for a rejected transition or an unexpected error. */
export const START_ERROR_TITLE = 'Could not start this test';
export const START_ERROR_MESSAGE =
  'Something went wrong while starting your test. Please try again.';

/** Retry action label for the failure states. */
export const RETRY_LABEL = 'Try again';
