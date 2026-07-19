// Constant values for the TestManager authoring surface (Requirements 2.1,
// 2.5, 5.3).
//
// Centralizes the user-facing copy, the Timing Mode select options, and the
// Test authoring bounds so the container and its inline validation share a
// single source of truth. These bounds mirror the Backend Project's authoring
// limits (backend `constants/limits.constant.ts`); the Backend API remains the
// authority and re-validates every submission (Req 2.1, 2.5).

import type { TestTimingMode } from '@/types/testSeries.types';

// ---- Authoring bounds (mirror the backend, Req 2.1) ----------------------

/** Inclusive Test title length bounds (Req 2.1). */
export const TEST_TITLE_MIN_LENGTH = 1;
export const TEST_TITLE_MAX_LENGTH = 200;

/** A Test's overall Time Limit must be a positive whole number of seconds. */
export const MIN_TIME_LIMIT_SECONDS = 1;

// ---- Timing Mode options (Req 2.2) ---------------------------------------

/** The selectable Timing Mode options for a Test (Req 2.2). */
export const TIMING_MODE_OPTIONS: ReadonlyArray<{
  value: TestTimingMode;
  label: string;
}> = [
  { value: 'overall', label: 'Overall timing (one shared time limit)' },
  { value: 'sectional', label: 'Sectional timing (per-section time limits)' },
];

/** The default Timing Mode selected when the create-Test form first renders. */
export const DEFAULT_TIMING_MODE: TestTimingMode = 'overall';

// ---- Section heading copy ------------------------------------------------

export const MANAGER_TITLE = 'Test Series';
export const MANAGER_SUBTITLE =
  'Create timed tests, then add sections and questions to each one.';

export const CREATE_SECTION_TITLE = 'Create a test';
export const TESTS_SECTION_TITLE = 'Your tests';

// ---- Create-Test form field copy -----------------------------------------

export const TEST_TITLE_FIELD_ID = 'test-title';
export const TEST_TITLE_LABEL = 'Title';
export const TEST_TITLE_PLACEHOLDER = 'e.g. Full-length Mock Test 1';

export const TEST_TIMING_FIELD_ID = 'test-timing-mode';
export const TEST_TIMING_LABEL = 'Timing mode';

export const TEST_TIME_LIMIT_FIELD_ID = 'test-time-limit';
export const TEST_TIME_LIMIT_LABEL = 'Overall time limit (seconds)';
export const TEST_TIME_LIMIT_PLACEHOLDER = 'e.g. 3600';
export const TEST_TIME_LIMIT_HINT =
  'A positive whole number of seconds for the whole test.';

export const TEST_PRICE_FIELD_ID = 'test-price';
export const TEST_PRICE_LABEL = 'Price (paise)';
export const TEST_PRICE_PLACEHOLDER = 'Leave blank for a free test';
export const TEST_PRICE_HINT =
  'Amount in paise. Leave blank or 0 to offer the test for free.';

// ---- Action labels --------------------------------------------------------

export const CREATE_SUBMIT_LABEL = 'Create test';
export const EDIT_LABEL = 'Edit';
export const BACK_TO_LIST_LABEL = 'Back to tests';
export const RETRY_LABEL = 'Try again';

// ---- Free / priced indicators (Req 2.4, 5.3) ------------------------------

export const FREE_BADGE_LABEL = 'Free';

// ---- Feedback + empty/error copy ------------------------------------------

export const CREATE_SUCCESS_MESSAGE = 'Test created.';
export const GENERIC_ACTION_ERROR = 'The action could not be completed.';
export const TESTS_EMPTY_MESSAGE =
  'No tests yet. Create your first test above.';
export const TESTS_ERROR_TITLE = 'Could not load tests';
export const TESTS_ERROR_MESSAGE =
  'Your tests could not be loaded. Please try again.';
export const EDIT_LOAD_ERROR_MESSAGE =
  'This test could not be opened for editing. Please try again.';

// ---- Inline validation messages (Req 2.5) ---------------------------------

export const TITLE_REQUIRED_ERROR = `Enter a title of ${TEST_TITLE_MIN_LENGTH}–${TEST_TITLE_MAX_LENGTH} characters.`;
export const TIME_LIMIT_INVALID_ERROR =
  'Enter a positive whole number of seconds.';
export const PRICE_INVALID_ERROR =
  'Enter a whole number of paise (or leave blank for free).';

