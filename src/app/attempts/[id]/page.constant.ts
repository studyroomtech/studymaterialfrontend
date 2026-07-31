// Constant values for the attempt review page (Req 14.2).
//
// The review page shows one completed Test Attempt: each Question's text, its
// Options, the Correct Option Set, and the Learner's recorded Response. These
// literals live here so the page module stays free of constant-literal exports.

/** Back link to the history list. */
export const BACK_TO_HISTORY_LABEL = '← Back to your past tests';
export const HISTORY_HREF = '/attempts';

/** Loading state copy (Req 7.3). */
export const REVIEW_LOADING_LABEL = 'Loading your test review…';

/** Error state copy shown when the review request fails (no partial/stale view). */
export const REVIEW_ERROR_TITLE = 'Could not load this test review';
export const REVIEW_ERROR_MESSAGE =
  'We could not load this attempt. It may not exist or may not belong to you.';

/** Header labels. The Score itself is rendered by `ResultSummary`, which reports
 * it against the marks that were obtainable. */
export const COMPLETED_AT_LABEL = 'Completed';

/** Link from a single result out to the Learner's performance across all tests. */
export const PERFORMANCE_HREF = '/performance';
export const PERFORMANCE_LINK_LABEL = 'See your overall performance →';

/** Questions section copy. */
export const QUESTIONS_HEADING = 'Questions';
export const QUESTION_LABEL_PREFIX = 'Question';

/** Per-option annotations for the Correct Option Set and the recorded Response. */
export const CORRECT_OPTION_BADGE = 'Correct answer';
export const YOUR_ANSWER_BADGE = 'Your answer';

/** Shown for a Question the Learner left unanswered. */
export const UNANSWERED_LABEL = 'You did not answer this question.';

/** Accessible label for the missing-attempt-id case. */
export const INVALID_ID_MESSAGE =
  'No attempt was specified, so there is nothing to review.';
