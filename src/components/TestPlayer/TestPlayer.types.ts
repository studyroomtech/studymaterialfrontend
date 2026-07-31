// Type declarations for the TestPlayer component (Req 9.3, 9.4, 10.1, 10.3,
// 11.1, 12.5). All type/interface declarations for the component live here so
// the component module stays free of type declarations (mirroring the sibling
// component convention).
//
// The TestPlayer is a presentational component: it is driven entirely by the
// server-authoritative `AttemptStateDto` (Attempt Status, server-computed
// remaining time, per-Section state, and which Section is currently active)
// plus a player-facing list of Questions to render, and it delegates every
// timing/scoring decision to the server via the supplied action callbacks.
//
// The client countdown is display only and never the source of truth (Req 9.2,
// 9.3): it seeds from the server's value on every refreshed `AttemptStateDto`
// and, when it reaches zero, asks the parent to re-read the server state rather
// than deciding for itself what happens next. Under Sequential Sectional Timing
// that is what carries the Learner from one Section into the next.

import type {
  AttemptStateDto,
  AttemptStatus,
  SubmitResponseInput,
} from '../../types/testSeries.types';

/**
 * A selectable Option within a Question as rendered by the player: a stable
 * identifier and its display text. The correct/incorrect flag is intentionally
 * absent — correctness is never revealed during an attempt and is scored by the
 * server on submit (Req 13.1, D4).
 */
export interface TestPlayerOption {
  /** Stable identifier of the Option, sent back in the Response. */
  id: string;
  /** The Option's display text. */
  text: string;
}

/**
 * A Question as rendered by the player: its text, the Section it belongs to
 * (used to resolve per-Section status under Sectional Timing, Req 12.5), and
 * its Options. `allowMultiple` selects the input affordance — when true (the
 * default) the Learner may select more than one Option, since the server scores
 * by exact-set-equality across single- and multiple-correct Questions (D4).
 */
export interface TestPlayerQuestion {
  /** Stable identifier of the Question, sent as `questionId` in the Response. */
  id: string;
  /** The id of the Section this Question belongs to. */
  sectionId: string;
  /** The Question's display text. */
  text: string;
  /** The Question's Options, in Admin-defined order. */
  options: TestPlayerOption[];
  /**
   * Whether multiple Options may be selected. Defaults to `true` so the player
   * always supports multiple-correct selection; the server enforces scoring
   * (Req 13.1, D4).
   */
  allowMultiple?: boolean;
}

/**
 * Props for the {@link TestPlayer}. The component is props-driven and
 * presentational so the attempt page (task 18.4) can wire it to `useAttempt`:
 * it passes the server-provided `state`, the Questions to render, and the
 * action callbacks (each backed by a `useAttempt` action). All loading flags
 * mirror the corresponding `useAttempt` in-flight state.
 */
export interface TestPlayerProps {
  /**
   * The server-authoritative attempt state — the single source of truth for
   * Attempt Status, remaining time, and per-Section state (Req 9.3, 10.1, 10.3,
   * 12.5). The component renders this as-is and never derives timing on its own.
   */
  state: AttemptStateDto;
  /**
   * The Questions to render for the attempt, in navigation order. When empty
   * the player shows a "no questions" message rather than an interactive scope.
   */
  questions: TestPlayerQuestion[];
  /**
   * The Learner's previously recorded selections keyed by Question id, used to
   * seed the player's draft selections so a resumed attempt shows prior answers.
   * Defaults to no prior selections.
   */
  initialSelections?: Record<string, string[]>;
  /**
   * Save the current Question's selected Option set (Req 9.4). Backed by
   * `useAttempt.submitResponse`; the server records the Response and returns a
   * refreshed `state`.
   */
  onSubmitResponse: (input: SubmitResponseInput) => void;
  /** Pause the `in_progress` attempt (Req 10.1). Backed by `useAttempt.pause`. */
  onPause: () => void;
  /** Resume the `paused` attempt (Req 10.3). Backed by `useAttempt.resume`. */
  onResume: () => void;
  /**
   * Finalize the attempt (Req 11.4, 12.7). Backed by `useAttempt.submit`; the
   * parent navigates to the review once the result resolves.
   */
  onSubmit: () => void;
  /**
   * Re-read the server's attempt state. Called on a fixed interval while a
   * scope is running and the instant the display countdown reaches zero, so the
   * server can close an exhausted Section and open the next one. Backed by
   * `useAttempt.syncState`; the parent navigates to the review only if the
   * refreshed state comes back `completed`.
   */
  onTimeExpired: () => void;
  /**
   * End the active Section early and move to the next one under Sequential
   * Sectional Timing. Backed by `useAttempt.advanceSection`. The player asks the
   * Learner to confirm first, since the Section locks irreversibly.
   */
  onAdvanceSection: () => void;
  /** `true` while a pause request is in flight — disables the pause control. */
  isPausing?: boolean;
  /** `true` while a resume request is in flight — disables the resume control. */
  isResuming?: boolean;
  /** `true` while a Section-advance request is in flight. */
  isAdvancingSection?: boolean;
  /** `true` while a Response is being recorded — disables the save control. */
  isSavingResponse?: boolean;
  /** `true` while the submit request is in flight — disables the submit control. */
  isSubmitting?: boolean;
  /**
   * A user-facing message describing why the most recent attempt request failed
   * (e.g. a rejected Response while paused/expired, Req 10.4, 11.3, 12.4). When
   * present it is surfaced inline without wiping the current view.
   */
  failureMessage?: string;
  /** Optional additional class name applied to the player root element. */
  className?: string;
}

/**
 * The lifecycle status of the scope the current Question belongs to — the
 * Section Attempt under Sectional Timing, or the Test Attempt under Overall
 * Timing. Used to decide whether Responses can be saved for the Question.
 */
export type TestPlayerScopeStatus = AttemptStatus;
