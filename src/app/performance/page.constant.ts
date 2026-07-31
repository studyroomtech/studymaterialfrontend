// Constant values for the performance page.
//
// The performance page reports the signed-in Learner's results across every
// completed Test Attempt: overall totals, a per-Test trend across retakes, and
// a per-Section ranking of strong and weak areas. These literals live here so
// the page module stays free of constant-literal exports (matching the
// `page.constant.ts` convention used across the App Router pages).

/** Page heading and supporting copy. */
export const PERFORMANCE_TITLE = 'Your performance';
export const PERFORMANCE_SUBTITLE =
  'How you are doing across every test you have completed, section by section.';

/** Accessible labels for the page regions. */
export const OVERVIEW_REGION_LABEL = 'Overall performance';
export const SECTIONS_REGION_LABEL = 'Performance by section';
export const TESTS_REGION_LABEL = 'Performance by test';

/** Loading state copy (Req 7.3). */
export const PERFORMANCE_LOADING_LABEL = 'Loading your performance…';

/** Error state copy shown when the request fails (no partial/stale analytics). */
export const PERFORMANCE_ERROR_TITLE = 'Could not load your performance';
export const PERFORMANCE_ERROR_MESSAGE =
  'Something went wrong loading your results. Try again.';

/** Empty-state copy shown when the Learner has completed no attempts. */
export const PERFORMANCE_EMPTY_TITLE = 'No results yet';
export const PERFORMANCE_EMPTY_MESSAGE =
  'Complete a test and your scores, accuracy, and strongest sections will appear here.';

/** Overview figure labels. */
export const TESTS_COMPLETED_LABEL = 'Tests completed';
export const ATTEMPTS_LABEL = 'Attempts';
export const AVERAGE_LABEL = 'Average score';
export const BEST_LABEL = 'Best score';
export const ACCURACY_LABEL = 'Accuracy';
export const TIME_LABEL = 'Time spent';

/** Answer-breakdown labels, shared by the overview and the section rows. */
export const CORRECT_LABEL = 'Correct';
export const INCORRECT_LABEL = 'Incorrect';
export const SKIPPED_LABEL = 'Skipped';

/** Section ranking copy. */
export const SECTIONS_HEADING = 'Strongest and weakest sections';
export const SECTIONS_CAPTION =
  'Ranked by accuracy across every attempt. Sections you never answered are listed last.';
export const SECTION_ATTEMPTS_SUFFIX_ONE = 'attempt';
export const SECTION_ATTEMPTS_SUFFIX_MANY = 'attempts';

/** Per-Test trend copy. */
export const TESTS_HEADING = 'Progress by test';
export const TESTS_CAPTION =
  'Each row is one completed attempt, oldest first. Select a row to open its review.';
export const BEST_SHORT_LABEL = 'Best';
export const LATEST_SHORT_LABEL = 'Latest';
export const ATTEMPT_LABEL = 'Attempt';
export const MARKS_SUFFIX = 'marks';

/** Separates a score from the marks that were obtainable, e.g. "4.5 / 20". */
export const OUT_OF_SEPARATOR = '/';

/** Prefixes for the meters' accessible labels; the subject follows. */
export const SECTION_METER_LABEL_PREFIX = 'Accuracy in';
export const ATTEMPT_METER_LABEL_PREFIX =
  'Percentage of obtainable marks scored in attempt';

/** Shown for accuracy when nothing was answered — not the same as 0%. */
export const NO_ACCURACY_LABEL = '—';

export const PERCENT_SUFFIX = '%';

/** Base path a trend bar links to; the attempt id is appended. */
export const REVIEW_PATH_PREFIX = '/attempts';

/** Link back to the completed-attempt history list. */
export const HISTORY_HREF = '/attempts';
export const HISTORY_LINK_LABEL = '← Back to your past tests';
