// Constant values for the TestPlayer component (Req 9.3, 10.1, 10.3, 11.1,
// 12.5). Centralizes the player's user-facing copy and the Attempt Status
// display labels so the component module carries no literal strings.

import type { AttemptStatus } from '../../types/testSeries.types';

/** Accessible prefix announcing the server-computed remaining time (Req 9.3). */
export const REMAINING_TIME_LABEL = 'Time remaining';

/** Accessible prefix announcing the current Attempt Status. */
export const STATUS_LABEL_PREFIX = 'Status';

/** Label for the pause control (Req 10.1). */
export const PAUSE_ACTION_LABEL = 'Pause';

/** Label for the resume control (Req 10.3). */
export const RESUME_ACTION_LABEL = 'Resume';

/** Label for the finalize/submit control (Req 11.4, 12.7). */
export const SUBMIT_ACTION_LABEL = 'Submit test';

/** Label for the save-Response control (Req 9.4). */
export const SAVE_RESPONSE_LABEL = 'Save response';

/** Label for the previous-Question navigation control. */
export const PREVIOUS_QUESTION_LABEL = 'Previous';

/** Label for the next-Question navigation control. */
export const NEXT_QUESTION_LABEL = 'Next';

/** Prefix used when labelling a Question (e.g. "Question 3 of 10"). */
export const QUESTION_LABEL_PREFIX = 'Question';

/** Connector used in the "Question X of Y" progress label. */
export const QUESTION_PROGRESS_CONNECTOR = 'of';

/** Heading for the per-Section status overview under Sectional Timing (Req 12.5). */
export const SECTIONS_OVERVIEW_LABEL = 'Sections';

/** Message shown when the attempt carries no Questions to render. */
export const NO_QUESTIONS_MESSAGE =
  'No questions are available for this attempt.';

/** Banner shown when the attempt is completed and locked (Req 11.4, 12.7). */
export const COMPLETED_MESSAGE =
  'This attempt is complete. Your responses can no longer be changed.';

/** Banner shown while the attempt is paused (Req 10.1). */
export const PAUSED_MESSAGE =
  'This attempt is paused. Resume to continue answering.';

/** Notice shown when the current Question's Section is closed (Req 12.4, 12.5). */
export const SECTION_CLOSED_MESSAGE =
  'This section is closed. Its questions can no longer be answered.';

/** Human-readable Attempt Status labels keyed by the server status value. */
export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  in_progress: 'In progress',
  paused: 'Paused',
  completed: 'Completed',
};

/** Placeholder shown for remaining time before a value is known. */
export const REMAINING_TIME_PLACEHOLDER = '--:--';

/** Seconds in a minute / minutes in an hour, for formatting remaining time. */
export const SECONDS_PER_MINUTE = 60;

/** Minutes in an hour, for formatting remaining time beyond an hour. */
export const MINUTES_PER_HOUR = 60;
