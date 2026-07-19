// Shared client-side DTO types for the Test Series feature.
//
// These mirror the Backend API contract (backend `src/types/domain.types.ts`,
// `src/services/testSeries.service.types.ts`, `src/services/attempt.service.types.ts`,
// and the product-cart `ProductRef`) so the Frontend Project is strictly typed
// against the server. The server owns every timing/scoring/access/pricing
// decision; the client renders these shapes as-is. Following the platform
// serialization contract: timestamps are ISO 8601 UTC `Z` strings, monetary
// amounts are integer paise + Currency, and marks are decimal marks (Req 16.3,
// 16.5, R3). Type/value declarations only — no logic.

// --- Shared enums (string unions mirror the Prisma enums / backend contract) ---

/**
 * The lifecycle state of a Test Attempt or Section Attempt (Attempt Status).
 * Mirrors the backend `AttemptStatus`.
 */
export type AttemptStatus = 'in_progress' | 'paused' | 'completed';

/**
 * The Timing Mode of a Test — exactly one of Overall Timing or Sectional
 * Timing. Mirrors the backend `TestTimingMode` (Req 2.2).
 */
export type TestTimingMode = 'overall' | 'sectional';

// --- Home Page listings (GET /api/tests) ----------------------------------

/**
 * A Test offered on the Home Page as a Test Series product (Req 6.1–6.3). Free
 * Tests are included with `priceAmount` null and `isFree` true; priced Tests
 * carry a positive paise `priceAmount` and Currency.
 */
export interface TestSeriesListingDto {
  id: string;
  title: string;
  timingMode: TestTimingMode;
  timeLimitSeconds: number;
  /** Paise; null => free Test (Req 6.2, 6.3). */
  priceAmount: number | null;
  currency: string;
  isFree: boolean;
  /**
   * Whether the requesting Learner already holds a Payment Entitlement for this
   * Test — `true` shows "Start test" instead of "Buy" (Req 2.3). Resolved from
   * the caller's Access Token; `false` for an unauthenticated caller.
   */
  isEntitled: boolean;
}

/**
 * A Section offered on the Home Page as a Sectional Test product (Req 6.1, 6.2).
 * Only Sections with a positive Price are listed, so `priceAmount` is always
 * present and positive.
 */
export interface SectionalTestListingDto {
  sectionId: string;
  testId: string;
  title: string;
  timeLimitSeconds: number;
  /** Paise; always positive for a Sectional Test product (Req 6.2). */
  priceAmount: number;
  currency: string;
  /**
   * Whether the requesting Learner already holds a Payment Entitlement for this
   * Section — `true` shows "Start test" instead of "Buy" (Req 2.3). Resolved
   * from the caller's Access Token; `false` for an unauthenticated caller.
   */
  isEntitled: boolean;
}

/**
 * The response body of `GET /api/tests`: the Test Series and Sectional Test
 * listings for the Home Page (Req 6.2).
 */
export interface TestListingsResponse {
  testSeries: TestSeriesListingDto[];
  sectionalTests: SectionalTestListingDto[];
}

// --- Attempt state (start/resume/pause/respond) ---------------------------

/**
 * The per-Section timing/status snapshot within an attempt (used under
 * Sectional Timing, Req 12.1). `remainingSeconds` is the server-computed
 * remaining time for that Section Attempt.
 */
export interface SectionStateDto {
  sectionId: string;
  status: AttemptStatus;
  /** Server-computed remaining time for this Section (Req 12.1). */
  remainingSeconds: number;
}

/**
 * The server-authoritative state of a Test Attempt returned on
 * start/resume/pause/respond (Req 9.1–9.3, 10.1, 10.3). All timing decisions are
 * the server's; the client renders this state as-is.
 */
export interface AttemptStateDto {
  attemptId: string;
  testId: string;
  status: AttemptStatus;
  timingMode: TestTimingMode;
  /** Start Timestamp, ISO 8601 UTC `Z` (Req 9.1, 16.3). */
  startedAt: string;
  /** Server-computed remaining time for the attempt scope (Req 9.3). */
  remainingSeconds: number;
  /** Per-Section status + remaining time (Sectional Timing, Req 12.1). */
  sections: SectionStateDto[];
  /** Present only when `status === 'completed'`; decimal marks (R3, Req 13.5). */
  scoreMarks?: number;
}

/**
 * The result returned when an attempt is finalized via
 * `POST /api/attempts/:id/submit` (Req 11.4, 12.7). The attempt is `completed`
 * with its Score serialized as decimal marks and its completion instant as an
 * ISO 8601 UTC `Z` string.
 */
export interface AttemptResultDto {
  attemptId: string;
  testId: string;
  status: 'completed';
  /** Total Score as decimal marks (R3, Req 13.5). */
  scoreMarks: number;
  /** Completion time, ISO 8601 UTC `Z` (Req 16.3). */
  completedAt: string;
}

/**
 * The Learner's selected Option set for one Question, submitted to
 * `POST /api/attempts/:id/responses` during an in_progress attempt scope
 * (Req 9.4). Recorded as-is; scoring uses set equality (R3/D4).
 */
export interface SubmitResponseInput {
  questionId: string;
  selectedOptionIds: string[];
}

// --- Attempt history + review (GET /api/attempts[/:id]) -------------------

/**
 * An Option as surfaced in an attempt review — identifier and display text only
 * (the correct/incorrect flag is conveyed via `ReviewQuestionDto.correctOptionIds`).
 */
export interface ReviewOptionDto {
  id: string;
  text: string;
}

/**
 * One Question as surfaced in an attempt review (Req 14.2): the Question text,
 * its Options, the Correct Option Set, and the Learner's recorded Response.
 */
export interface ReviewQuestionDto {
  questionId: string;
  text: string;
  /** The Question's Options, in Admin-defined order. */
  options: ReviewOptionDto[];
  /** The ids of the Options flagged correct (the Correct Option Set, Req 14.2). */
  correctOptionIds: string[];
  /** The ids of the Options the Learner selected; empty when unanswered. */
  selectedOptionIds: string[];
}

/**
 * One Question surfaced to a Learner while taking an attempt
 * (`GET /api/attempts/:id/questions`, Req 9.4): the Question text, its Options
 * (id + text only — correctness is never exposed while the attempt is open), and
 * the Learner's currently recorded selection so a resumed attempt can seed prior
 * answers.
 */
export interface AttemptQuestionDto {
  questionId: string;
  sectionId: string;
  text: string;
  options: ReviewOptionDto[];
  /** The ids of the Options the Learner has currently selected; empty when unanswered. */
  selectedOptionIds: string[];
}

/**
 * The in-scope Questions for a Learner's open attempt
 * (`GET /api/attempts/:id/questions`, Req 9.4), in Admin-defined order. For a
 * Section-scoped attempt only the covered Section's Questions are returned.
 */
export interface AttemptQuestionsDto {
  attemptId: string;
  questions: AttemptQuestionDto[];
}

/**
 * A completed Test Attempt reviewed by its owning Learner
 * (`GET /api/attempts/:id`, Req 14.2). Returns every Question with its Options,
 * Correct Option Set, and recorded Response.
 */
export interface AttemptReviewDto {
  attemptId: string;
  testTitle: string;
  /** Total Score as decimal marks (R3, Req 13.5). */
  scoreMarks: number;
  /** Completion time, ISO 8601 UTC `Z` (Req 16.3). */
  completedAt: string;
  questions: ReviewQuestionDto[];
}

/**
 * One entry in a Learner's attempt history (`GET /api/attempts`): a completed
 * Test Attempt with its Test title, total Score, and completion time (Req 14.1).
 */
export interface AttemptHistoryItemDto {
  attemptId: string;
  testId: string;
  testTitle: string;
  /** Total Score as decimal marks (R3, Req 13.5). */
  scoreMarks: number;
  /** Completion time, ISO 8601 UTC `Z` (Req 16.3). */
  completedAt: string;
}

// --- Product cart (POST /api/payments/initiate-products) ------------------

/**
 * A purchasable product reference in a product-cart order: a Test or a Sectional
 * Test, keyed by `(type, id)` (Req 7.1, 7.6). Mirrors the backend `ProductRef`.
 */
export type ProductRef = { type: 'test' | 'section'; id: string };

// --- Admin authoring inputs (POST/PATCH /api/admin/**) --------------------

/**
 * A single Option supplied when authoring a Question (Req 4.1). `text` is the
 * display text (1–1000 chars); `isCorrect` flags membership of the Correct
 * Option Set (Req 4.2).
 */
export interface OptionInput {
  text: string;
  isCorrect: boolean;
}

/**
 * The input to create a Question: its text (1–2000 chars) and two or more
 * Options, at least one flagged correct (Req 4.1, 4.2).
 */
export interface CreateQuestionInput {
  text: string;
  options: OptionInput[];
}

/**
 * The editable Question fields (Req 5.2). Every field is optional so callers can
 * patch a subset; when `options` is supplied it fully replaces the Question's
 * Options (still subject to the ≥2 Options / ≥1 correct bounds).
 */
export interface EditQuestionInput {
  text?: string;
  options?: OptionInput[];
}

/**
 * The input to create a Section together with its Questions (Req 3.1–3.4, 5.1).
 * `correctMark`/`negativeMark` are non-negative decimal marks; `timeLimitSeconds`
 * is a positive whole number; the optional Price amount is integer paise
 * (null/0 => reachable only via the parent Test's Entitlement, Req 3.4).
 */
export interface CreateSectionInput {
  title: string;
  timeLimitSeconds: number;
  correctMark: number;
  negativeMark: number;
  priceAmount?: number | null;
  currency?: string | null;
  questions?: CreateQuestionInput[];
}

/**
 * The editable Section fields and, optionally, a full replacement of its
 * Questions (Req 5.2). Every field is optional; omitted fields are left
 * unchanged and no other Section is altered (Req 5.5).
 */
export interface EditSectionInput {
  title?: string;
  timeLimitSeconds?: number;
  correctMark?: number;
  negativeMark?: number;
  priceAmount?: number | null;
  currency?: string | null;
  questions?: CreateQuestionInput[];
}

/**
 * The input to create a Test (Req 2.1–2.4): a title (1–200 chars), a Timing
 * Mode (exactly `overall` or `sectional`), a positive whole-second overall Time
 * Limit, and an optional Price amount in integer paise (null/0 => free Test).
 */
export interface CreateTestInput {
  title: string;
  timingMode: TestTimingMode;
  timeLimitSeconds: number;
  priceAmount?: number | null;
  currency?: string | null;
}

/**
 * The editable Test-level fields (Req 5.5). Every field is optional; omitted
 * fields are left unchanged and every Section is left untouched.
 */
export interface EditTestInput {
  title?: string;
  timingMode?: TestTimingMode;
  timeLimitSeconds?: number;
  priceAmount?: number | null;
  currency?: string | null;
}

// --- Admin authoring response DTOs ----------------------------------------

/**
 * A Test's authoring metadata (Req 2.1–2.4). `priceAmount` is integer paise
 * (`null` for a free Test); `isFree` mirrors the pure price classification.
 * Timestamps are ISO 8601 UTC `Z` strings (Req 16.3).
 */
export interface TestDto {
  id: string;
  title: string;
  timingMode: TestTimingMode;
  timeLimitSeconds: number;
  priceAmount: number | null;
  currency: string;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * An Option within the admin authoring view: its identifier, display text, the
 * correct/incorrect flag (visible to the authoring Admin), and its
 * Admin-defined position (Req 4.1, 5.3).
 */
export interface OptionDto {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

/**
 * A Question within the admin authoring view with its ordered Options (Req 3.6,
 * 4.1, 5.3).
 */
export interface QuestionDto {
  id: string;
  sectionId: string;
  text: string;
  orderIndex: number;
  options: OptionDto[];
}

/**
 * A Section within the admin authoring view (Req 3.1–3.6, 5.3). Marks are
 * surfaced as decimal marks; `priceAmount` is integer paise (`null` when
 * reachable only via the parent Test); `isPriced` is true iff the Section is an
 * independently purchasable Sectional Test product (Req 3.3).
 */
export interface SectionDto {
  id: string;
  testId: string;
  title: string;
  orderIndex: number;
  timeLimitSeconds: number;
  correctMark: number;
  negativeMark: number;
  priceAmount: number | null;
  currency: string;
  isPriced: boolean;
  questions: QuestionDto[];
}

/**
 * The full admin authoring view for a Test (`GET /api/admin/tests/:id`): the
 * Test metadata plus its ordered Sections → Questions → Options (Req 5.3).
 */
export interface AdminTestDto extends TestDto {
  sections: SectionDto[];
}
