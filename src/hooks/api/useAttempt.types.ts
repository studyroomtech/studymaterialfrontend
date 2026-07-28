// Type declarations for the `useAttempt` orchestration hook (Req 9.1, 9.3,
// 9.4, 9.5, 10.1, 10.3, 10.4, 11.3, 12.4, 15.1, 15.5). All type/interface
// declarations live here so the hook module stays free of type declarations
// (Req 1.15, 1.17).
//
// The attempt hook drives the Test Player: it starts/resumes a Test- or
// Section-scoped attempt, pauses/resumes it, records Responses, finalizes it,
// and retakes it. The server owns every timing/scoring decision, so the hook
// holds the server-provided `AttemptStateDto` as the single source of truth and
// renders it as-is (Req 9.2, 9.3). The request/response shapes mirror the
// attempt endpoints documented in the design's Frontend → Attempt player and
// history section and reuse the shared DTO types rather than redeclaring them.

import type {
  AttemptResultDto,
  AttemptStateDto,
  SubmitResponseInput,
} from '@/types/testSeries.types';
import type { HttpError } from '@/utils/http.types';

// --- Request/response shapes for the attempt endpoints --------------------
//
// start/resume/pause/resume/respond/retake all return the server-authoritative
// attempt state; only the final submit returns the completed result. These
// aliases name each endpoint's contract so the hook and its callers stay tied
// to the shared DTOs (the single source of truth) while reading intent-first.

/**
 * Response body of `POST /api/tests/:id/attempts`: the server-authoritative
 * attempt state for a started or resumed Test Attempt (Req 9.1, 9.5). When a
 * `in_progress`/`paused` attempt already exists it is returned as-is rather than
 * a new one being created (Req 9.5).
 */
/**
 * The shared response envelope the Backend uses for every attempt-state
 * endpoint: the server-authoritative `AttemptStateDto` wrapped under an
 * `attempt` key (mirroring the `{ material }` / `{ test }` envelopes elsewhere).
 * The hook unwraps `.attempt` before storing it as the single source of truth.
 */
export interface AttemptStateResponse {
  attempt: AttemptStateDto;
}

export type StartTestAttemptResponse = AttemptStateResponse;

/**
 * Response body of `POST /api/sections/:id/attempts`: the server-authoritative
 * attempt state for a started or resumed Section-scoped Test Attempt (Req 9.1).
 */
export type StartSectionAttemptResponse = AttemptStateResponse;

/**
 * Response body of `POST /api/attempts/:id/pause`: the updated attempt state
 * with the Attempt Status set to `paused` and the server-computed remaining
 * time (Req 10.1).
 */
export type PauseAttemptResponse = AttemptStateResponse;

/**
 * Response body of `POST /api/attempts/:id/resume`: the updated attempt state
 * with the Attempt Status set back to `in_progress` and the server-computed
 * remaining time; scopes already at their Time Limit are closed server-side
 * (Req 10.3, 10.5).
 */
export type ResumeAttemptResponse = AttemptStateResponse;

/**
 * Request body of `POST /api/attempts/:id/responses`: the Learner's selected
 * Option set for one Question, recorded as-is during an `in_progress` attempt
 * scope (Req 9.4).
 */
export type SubmitResponseRequest = SubmitResponseInput;

/**
 * Response body of `POST /api/attempts/:id/responses`: the refreshed
 * server-authoritative attempt state after the Response is recorded (Req 9.4).
 */
export type SubmitResponseResponse = AttemptStateResponse;

/**
 * Response body of `POST /api/attempts/:id/submit`: the finalized, `completed`
 * attempt result carrying the server-computed Score and completion time,
 * wrapped under a `result` key (Req 11.4, 12.7).
 */
export interface SubmitAttemptResponse {
  result: AttemptResultDto;
}

/**
 * Response body of `POST /api/tests/:id/retake`: the state of a fresh Test
 * Attempt created for a retake, independent of the prior completed attempt
 * (Req 15.1, 15.5).
 */
export type RetakeTestResponse = AttemptStateResponse;

// --- UI-consumable outcome -----------------------------------------------

/**
 * A UI-consumable classification of an attempt request result, mapped from the
 * Backend API `HttpError` envelope so the Test Player can react without
 * inspecting raw status codes:
 *   - `success`          the request succeeded.
 *   - `auth_required`    `AUTH_REQUIRED` (HTTP 401) — no/expired token.
 *   - `payment_required` `PAYMENT_REQUIRED` (HTTP 403) — no Entitlement (Req 8.x).
 *   - `not_found`        `NOT_FOUND` (HTTP 404) — no such Test/Section/attempt.
 *   - `invalid`          `VALIDATION_ERROR` (HTTP 422) — e.g. a Response while
 *                        paused or after the Time Limit (Req 10.4, 11.3, 12.4).
 *   - `error`            any other failure (timeout, network, unexpected).
 */
export type AttemptOutcome =
  | 'success'
  | 'auth_required'
  | 'payment_required'
  | 'not_found'
  | 'invalid'
  | 'error';

// --- Hook contract --------------------------------------------------------

/**
 * Value returned by {@link useAttempt}. The hook holds the server-provided
 * {@link AttemptStateDto} as the single source of truth for remaining time,
 * Attempt Status, and per-Section state — all timing/scoring decisions are the
 * server's (Req 9.2, 9.3) — and exposes the attempt operations plus
 * loading/error/outcome state so the Test Player can render feedback and the
 * attempt pages can navigate on completion.
 */
export interface UseAttemptResult {
  /**
   * The current server-authoritative attempt state, or `null` before an attempt
   * has been started/resumed. Preserved across a later failure so the player can
   * keep rendering the current view (Req 8.1, 9.3).
   */
  state: AttemptStateDto | null;
  /**
   * The finalized result once the attempt has been submitted, or `null` while
   * still in progress (Req 11.4, 12.7).
   */
  result: AttemptResultDto | null;

  /**
   * Start or resume a Test Attempt for the given Test. An existing
   * `in_progress`/`paused` attempt is returned rather than a new one being
   * created (Req 9.1, 9.5). Resolves with the attempt state, or `null` on
   * failure (inspect {@link outcome}/{@link error}).
   */
  start: (testId: string) => Promise<AttemptStateDto | null>;
  /**
   * Start or resume a Section-scoped Test Attempt for the given Section
   * (Req 9.1). Resolves with the attempt state, or `null` on failure.
   */
  startSection: (sectionId: string) => Promise<AttemptStateDto | null>;
  /**
   * Pause the current `in_progress` attempt, stopping active-time accumulation
   * (Req 10.1). Resolves with the updated state, or `null` on failure.
   */
  pause: () => Promise<AttemptStateDto | null>;
  /**
   * Resume the current `paused` attempt, continuing from the held Accumulated
   * Active Time (Req 10.3). Resolves with the updated state, or `null` on
   * failure.
   */
  resume: () => Promise<AttemptStateDto | null>;
  /**
   * Record the Learner's selected Options for one Question in the current
   * `in_progress` attempt scope (Req 9.4). Rejected server-side while paused or
   * once the Time Limit is reached (Req 10.4, 11.3). Resolves with the refreshed
   * state, or `null` on failure.
   */
  submitResponse: (input: SubmitResponseInput) => Promise<AttemptStateDto | null>;
  /**
   * Finalize the current attempt: the server sets it `completed` and computes
   * the Score (Req 11.4, 12.7). Resolves with the result, or `null` on failure.
   */
  submit: () => Promise<AttemptResultDto | null>;
  /**
   * Retake a previously completed Test by starting a fresh, independent Test
   * Attempt (Req 15.1, 15.5). Resolves with the new attempt state, or `null` on
   * failure.
   */
  retake: (testId: string) => Promise<AttemptStateDto | null>;

  /** `true` while a start/resume/retake request is in flight (Req 7.3). */
  isStarting: boolean;
  /** `true` while a pause request is in flight (Req 7.3). */
  isPausing: boolean;
  /** `true` while a resume request is in flight (Req 7.3). */
  isResuming: boolean;
  /** `true` while a Response is being recorded (Req 7.3). */
  isSavingResponse: boolean;
  /** `true` while the finalize/submit request is in flight (Req 7.3). */
  isSubmitting: boolean;

  /** The most recent attempt-request failure, or `null` when none (Req 8.1). */
  error: HttpError | null;
  /** The UI-consumable classification of the most recent request (Req 8.x). */
  outcome: AttemptOutcome | null;
  /** A user-facing message describing why the most recent request failed. */
  failureMessage?: string;
}
