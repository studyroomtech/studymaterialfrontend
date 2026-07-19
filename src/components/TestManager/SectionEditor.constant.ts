// Constant values for the incremental Section + Questions editor
// (`SectionEditor.tsx`). References: Req 3.1, 4.1, 5.1, 5.2, 5.3.
//
// Centralizes the authoring bounds, the user-facing copy, and the inline
// validation messages so the editor and its client-side pre-validation share a
// single source of truth. These bounds mirror the Backend Project's authoring
// limits (backend `constants/limits.constant.ts`); the Backend API remains the
// authority and re-validates every submission (Req 3.5, 4.4).

// ---- Authoring bounds (mirror the backend) -------------------------------

/** Inclusive Section title length bounds (shares the Test title bound). */
export const SECTION_TITLE_MIN_LENGTH = 1;
export const SECTION_TITLE_MAX_LENGTH = 200;

/** A Section's Time Limit must be a positive whole number of seconds (Req 3.1). */
export const MIN_TIME_LIMIT_SECONDS = 1;

/** Inclusive Question text length bounds (Req 4.1). */
export const QUESTION_TEXT_MIN_LENGTH = 1;
export const QUESTION_TEXT_MAX_LENGTH = 2000;

/** Inclusive Option text length bounds (Req 4.1). */
export const OPTION_TEXT_MIN_LENGTH = 1;
export const OPTION_TEXT_MAX_LENGTH = 1000;

/** A Question must have at least this many Options, ≥1 flagged correct (Req 4.1, 4.2). */
export const MIN_OPTIONS_PER_QUESTION = 2;
export const MIN_CORRECT_OPTIONS_PER_QUESTION = 1;

// ---- Headings + copy ------------------------------------------------------

export const ADD_SECTION_HEADING = 'Add a section';
export const SAVED_SECTIONS_HEADING = 'Sections';
export const NO_SECTIONS_MESSAGE =
  'No sections yet. Add your first section below.';

// ---- Section form field copy ---------------------------------------------

export const SECTION_TITLE_LABEL = 'Section title';
export const SECTION_TITLE_PLACEHOLDER = 'e.g. Quantitative Aptitude';

export const SECTION_TIME_LIMIT_LABEL = 'Section time limit (seconds)';
export const SECTION_TIME_LIMIT_PLACEHOLDER = 'e.g. 1200';
export const SECTION_TIME_LIMIT_HINT =
  'A positive whole number of seconds for this section.';

export const SECTION_CORRECT_MARK_LABEL = 'Correct mark';
export const SECTION_CORRECT_MARK_PLACEHOLDER = 'e.g. 1';
export const SECTION_CORRECT_MARK_HINT =
  'Marks awarded for a correct answer (non-negative).';

export const SECTION_NEGATIVE_MARK_LABEL = 'Negative mark';
export const SECTION_NEGATIVE_MARK_PLACEHOLDER = 'e.g. 0.25';
export const SECTION_NEGATIVE_MARK_HINT =
  'Marks deducted for a wrong answer (non-negative).';

export const SECTION_PRICE_LABEL = 'Section price (paise)';
export const SECTION_PRICE_PLACEHOLDER = 'Leave blank if not sold separately';
export const SECTION_PRICE_HINT =
  'Amount in paise. Leave blank or 0 to make it reachable only via the test.';

// ---- Question + option copy ----------------------------------------------

export const QUESTIONS_HEADING = 'Questions';
export const QUESTION_TEXT_LABEL = 'Question text';
export const QUESTION_TEXT_PLACEHOLDER = 'Enter the question';
export const OPTION_TEXT_LABEL = 'Option text';
export const OPTION_TEXT_PLACEHOLDER = 'Enter an option';
export const OPTION_CORRECT_LABEL = 'Correct';

export const NO_QUESTIONS_TEXT = 'No questions added yet.';
export const QUESTION_LABEL_PREFIX = 'Question';
export const OPTIONS_COUNT_SUFFIX = 'options';

// ---- Action labels --------------------------------------------------------

export const ADD_SECTION_SUBMIT_LABEL = 'Add section';
export const SAVE_SECTION_LABEL = 'Save section';
export const ADD_QUESTION_LABEL = 'Add question';
export const SAVE_QUESTION_LABEL = 'Save question';
export const ADD_QUESTION_TO_SECTION_LABEL = 'Add a question';
export const ADD_OPTION_LABEL = 'Add option';
export const REMOVE_OPTION_LABEL = 'Remove';
export const REMOVE_QUESTION_LABEL = 'Remove question';
export const EDIT_SECTION_LABEL = 'Edit section';
export const EDIT_QUESTION_LABEL = 'Edit';
export const CANCEL_LABEL = 'Cancel';

// ---- Feedback + error copy ------------------------------------------------

export const SECTION_ADDED_MESSAGE = 'Section saved.';
export const SECTION_UPDATED_MESSAGE = 'Section updated.';
export const QUESTION_ADDED_MESSAGE = 'Question saved.';
export const QUESTION_UPDATED_MESSAGE = 'Question updated.';
export const GENERIC_ACTION_ERROR = 'The action could not be completed.';
export const RELOAD_ERROR_MESSAGE =
  'The section was saved but the view could not be refreshed. Please reopen the test.';

// ---- Inline validation messages (Req 3.5, 4.4) ----------------------------

export const SECTION_TITLE_ERROR = `Enter a title of ${SECTION_TITLE_MIN_LENGTH}–${SECTION_TITLE_MAX_LENGTH} characters.`;
export const TIME_LIMIT_ERROR = 'Enter a positive whole number of seconds.';
export const MARK_ERROR = 'Enter a non-negative number.';
export const PRICE_ERROR =
  'Enter a whole number of paise (or leave blank).';
export const QUESTION_TEXT_ERROR = `Enter question text of ${QUESTION_TEXT_MIN_LENGTH}–${QUESTION_TEXT_MAX_LENGTH} characters.`;
export const OPTIONS_ERROR = `Add at least ${MIN_OPTIONS_PER_QUESTION} options, each with text, and mark at least ${MIN_CORRECT_OPTIONS_PER_QUESTION} correct.`;

/** A fresh, empty Option draft (blank text, not correct). */
export const EMPTY_OPTION = { text: '', isCorrect: false } as const;
