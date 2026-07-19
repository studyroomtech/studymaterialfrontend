// Constant values for the attempt history page (Req 14.1, 14.5).
//
// The history page lists the signed-in Learner's completed Test Attempts, each
// linking to its review page. These literals live here so the page module stays
// free of constant-literal exports (matching the `page.constant.ts` convention
// used across the App Router pages).

/** Page heading and supporting copy. */
export const HISTORY_TITLE = 'Your past tests';
export const HISTORY_SUBTITLE =
  'Review the tests you have completed, with your score and answers.';

/** Accessible label for the results region. */
export const HISTORY_RESULTS_LABEL = 'Completed test attempts';

/** Loading state copy (Req 7.3). */
export const HISTORY_LOADING_LABEL = 'Loading your past tests…';

/** Error state copy shown when the history request fails (no partial/stale list). */
export const HISTORY_ERROR_TITLE = 'Could not load your past tests';
export const HISTORY_ERROR_MESSAGE =
  'Something went wrong loading your completed tests. Try again.';

/** Empty-state copy shown when the Learner has no completed attempts (Req 14.5). */
export const HISTORY_EMPTY_TITLE = 'No past tests yet';
export const HISTORY_EMPTY_MESSAGE =
  'When you complete a test, it will appear here so you can review it.';

/** Per-item copy. */
export const SCORE_LABEL = 'Score';
export const COMPLETED_AT_LABEL = 'Completed';
export const MARKS_SUFFIX = 'marks';
export const REVIEW_ACTION_LABEL = 'Review';

/** Base path a history entry links to; the attempt id is appended. */
export const REVIEW_PATH_PREFIX = '/attempts';
