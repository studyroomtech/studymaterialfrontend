"use client";

// TestPlayer component (Req 9.3, 9.4, 10.1, 10.3, 11.1, 12.5).
//
// A presentational player for a Test Attempt. It is driven entirely by the
// server-authoritative `AttemptStateDto` supplied by the parent (`AttemptRunner`,
// wiring `useAttempt`): it renders the server-computed remaining time and the
// Attempt/Section status as-is, provides Question navigation, option selection
// that calls `submitResponse`, pause/resume controls, and submit actions —
// deferring every timing/scoring decision to the server.
//
// The countdown shown is a display convenience only, never the source of truth
// (Req 9.2, 9.3). It re-seeds from the server on every refreshed
// `AttemptStateDto` and ticks down locally between refreshes; when it reaches
// zero it calls `onTimeExpired` so the SERVER decides what happens next, and a
// slower background poll covers clock drift and throttled background tabs.
//
// Under Sequential Sectional Timing the governing scope is the Section named by
// `state.currentSectionId` — not the Section of whichever Question is on screen.
// Only that Section's Questions are navigable: earlier Sections are locked for
// good and later ones have not opened yet. When the server reports a new
// current Section the player jumps to its first Question and explains the move.
//
// All styling lives in `TestPlayer.module.scss` (no inline CSS) and consumes
// the shared theme via the sibling `Button` and `ErrorMessage` components.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "../Button/Button";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import type {
  AttemptStatus,
  SectionStateDto,
} from "../../types/testSeries.types";
import styles from "./TestPlayer.module.scss";
import {
  ADVANCE_SECTION_CONFIRM_MESSAGE,
  ADVANCE_SECTION_LABEL,
  ATTEMPT_STATUS_LABELS,
  COMPLETED_MESSAGE,
  CURRENT_SECTION_LABEL_PREFIX,
  MINUTES_PER_HOUR,
  NEXT_QUESTION_LABEL,
  NO_QUESTIONS_MESSAGE,
  PAUSE_ACTION_LABEL,
  PAUSED_MESSAGE,
  PREVIOUS_QUESTION_LABEL,
  QUESTION_LABEL_PREFIX,
  QUESTION_PROGRESS_CONNECTOR,
  REMAINING_TIME_LABEL,
  REMAINING_TIME_PLACEHOLDER,
  RESUME_ACTION_LABEL,
  SAVE_RESPONSE_LABEL,
  SECONDS_PER_MINUTE,
  SECTION_ADVANCED_MESSAGE_DURATION_MS,
  SECTION_ADVANCED_MESSAGE_PREFIX,
  SECTION_ADVANCING_MESSAGE,
  SECTION_CLOSED_MESSAGE,
  SECTION_LOCKED_LABEL,
  SECTIONS_OVERVIEW_LABEL,
  STATE_SYNC_INTERVAL_MS,
  STATUS_LABEL_PREFIX,
  SUBMIT_ACTION_LABEL,
  SUBMIT_TEST_CONFIRM_MESSAGE,
} from "./TestPlayer.constant";
import type { TestPlayerProps } from "./TestPlayer.types";

/** Join a set of class names, dropping any falsy entries. */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/**
 * Format a server-provided remaining-seconds value as a human-readable clock.
 * The value is clamped at zero (an expired scope never shows negative time) and
 * rendered as `MM:SS`, or `H:MM:SS` beyond an hour. This is pure presentation
 * of the server's value — it is not a ticking client timer (Req 9.2, 9.3).
 */
function formatRemaining(remainingSeconds: number): string {
  if (!Number.isFinite(remainingSeconds)) {
    return REMAINING_TIME_PLACEHOLDER;
  }
  const total = Math.max(0, Math.floor(remainingSeconds));
  const seconds = total % SECONDS_PER_MINUTE;
  const totalMinutes = Math.floor(total / SECONDS_PER_MINUTE);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);

  const pad = (value: number): string => value.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

function TestPlayer({
  state,
  questions,
  initialSelections,
  onSubmitResponse,
  onPause,
  onResume,
  onSubmit,
  onTimeExpired,
  onAdvanceSection,
  isPausing = false,
  isResuming = false,
  isAdvancingSection = false,
  isSavingResponse = false,
  isSubmitting = false,
  failureMessage,
  className,
}: TestPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selections, setSelections] = useState<Record<string, string[]>>(
    () => ({ ...(initialSelections ?? {}) }),
  );

  // Question content is fetched after the attempt starts, so the Learner's
  // previously recorded answers arrive on a later render than the one that
  // seeded the draft state above. Merge them in when they land, leaving any
  // draft the Learner has already touched in this session untouched. This is
  // what makes a resumed attempt show the answers it has on file — which
  // matters far more now that a Sectional attempt is resumed across Sections.
  useEffect(() => {
    if (initialSelections === undefined) {
      return;
    }
    setSelections((previous) => ({ ...initialSelections, ...previous }));
  }, [initialSelections]);

  const isSectional = state.timingMode === "sectional";
  const isCompleted = state.status === "completed";
  const isPaused = state.status === "paused";
  const isInProgress = state.status === "in_progress";

  // Index the per-Section state so a Section's status and remaining time can be
  // resolved by id when rendering the rail (Req 12.5).
  const sectionStateById = useMemo<Record<string, SectionStateDto>>(() => {
    const map: Record<string, SectionStateDto> = {};
    for (const section of state.sections ?? []) {
      map[section.sectionId] = section;
    }
    return map;
  }, [state.sections]);

  // The governing scope under Sequential Sectional Timing is the Section the
  // SERVER says is active — never the Section of whichever Question happens to
  // be on screen. Tying the timer to the on-screen Question would let simple
  // navigation swap which clock is displayed.
  const currentSectionState =
    isSectional && state.currentSectionId !== null
      ? sectionStateById[state.currentSectionId]
      : undefined;

  // Only the active Section's Questions are attemptable: earlier Sections are
  // locked for good and later ones have not opened yet. Under Overall Timing
  // every Question stays reachable (Req 11.1).
  const visibleQuestions = useMemo(() => {
    if (!isSectional || state.currentSectionId === null) {
      return questions;
    }
    return questions.filter(
      (question) => question.sectionId === state.currentSectionId,
    );
  }, [isSectional, questions, state.currentSectionId]);

  const scopeStatus: AttemptStatus = currentSectionState
    ? currentSectionState.status
    : state.status;
  // The server-authoritative remaining time for the governing scope. This is
  // the value the client countdown seeds from on every fresh API response.
  const serverRemainingSeconds = currentSectionState
    ? currentSectionState.remainingSeconds
    : state.remainingSeconds;

  // Identifies the scope whose timer is displayed, so the countdown re-seeds
  // when the server moves the attempt on to the next Section.
  const scopeKey = currentSectionState
    ? currentSectionState.sectionId
    : state.attemptId;

  const hasQuestions = visibleQuestions.length > 0;
  const safeIndex = hasQuestions
    ? Math.min(currentIndex, visibleQuestions.length - 1)
    : 0;
  const currentQuestion = hasQuestions ? visibleQuestions[safeIndex] : undefined;

  // Whether the active Section is the last one, which decides whether the
  // primary action ends this Section or finalizes the whole attempt.
  const isLastSection = useMemo(() => {
    if (!isSectional || state.currentSectionId === null) {
      return true;
    }
    const upcoming = (state.sections ?? []).filter(
      (section) =>
        section.sectionId !== state.currentSectionId &&
        section.status === "not_started",
    );
    return upcoming.length === 0;
  }, [isSectional, state.currentSectionId, state.sections]);

  // The timer only ticks while the governing scope is actively `in_progress`
  // (i.e. not paused/completed) — pausing the attempt stops the countdown.
  const isTimerRunning = isInProgress && scopeStatus === "in_progress";

  // Client-side display countdown. The server stays authoritative: every time
  // the parent hands down a fresh `AttemptStateDto` (start/resume/respond/
  // section-change) the displayed seconds are re-seeded to the server value,
  // then tick down locally once per second while the scope is running.
  const [displaySeconds, setDisplaySeconds] = useState<number>(
    serverRemainingSeconds,
  );

  // Re-seed from the server whenever its value or the governing scope changes.
  useEffect(() => {
    setDisplaySeconds(serverRemainingSeconds);
  }, [serverRemainingSeconds, scopeKey]);

  // Tick down every second while running; frozen (interval cleared) when the
  // attempt is paused, completed, or the scope is otherwise not in progress.
  useEffect(() => {
    if (!isTimerRunning) {
      return undefined;
    }
    const interval = setInterval(() => {
      setDisplaySeconds((previous) => (previous <= 0 ? 0 : previous - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [isTimerRunning, serverRemainingSeconds, scopeKey]);

  // Start each Section at its first Question, and explain the jump so the
  // Learner is not surprised by the Questions changing under them.
  const previousSectionIdRef = useRef<string | null>(state.currentSectionId);
  const [advancedFromTitle, setAdvancedFromTitle] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (previousSectionIdRef.current === state.currentSectionId) {
      return;
    }
    const hadPreviousSection = previousSectionIdRef.current !== null;
    previousSectionIdRef.current = state.currentSectionId;
    setCurrentIndex(0);
    const nextSection =
      state.currentSectionId === null
        ? undefined
        : sectionStateById[state.currentSectionId];
    setAdvancedFromTitle(
      hadPreviousSection && nextSection ? nextSection.title : null,
    );
  }, [state.currentSectionId, sectionStateById]);

  // The hand-over notice explains a one-off event, so it retires itself instead
  // of sitting above the new Section for its whole duration.
  useEffect(() => {
    if (advancedFromTitle === null) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      setAdvancedFromTitle(null);
    }, SECTION_ADVANCED_MESSAGE_DURATION_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [advancedFromTitle]);

  // Guard so a single expiry triggers exactly one server sync. Reset whenever
  // the server reports fresh time on the scope, so the next expiry re-arms it.
  const expiryReportedRef = useRef<boolean>(false);
  useEffect(() => {
    if (serverRemainingSeconds > 0) {
      expiryReportedRef.current = false;
    }
  }, [serverRemainingSeconds, scopeKey]);

  // When the countdown reaches zero, ask the server what happens next rather
  // than deciding here. Under Sequential Sectional Timing reconciliation closes
  // the exhausted Section and opens the following one; only when nothing is
  // left does the attempt finalize. This is the fix for a Section timing out
  // previously submitting the entire test.
  useEffect(() => {
    if (displaySeconds > 0 || !isInProgress || expiryReportedRef.current) {
      return;
    }
    expiryReportedRef.current = true;
    onTimeExpired();
  }, [displaySeconds, isInProgress, onTimeExpired]);

  // Safety net for a drifting client clock or a backgrounded tab, where the
  // one-second interval is throttled and the countdown above may never reach
  // zero on time.
  useEffect(() => {
    if (!isTimerRunning) {
      return undefined;
    }
    const interval = setInterval(onTimeExpired, STATE_SYNC_INTERVAL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [isTimerRunning, onTimeExpired]);

  // Responses are accepted only while the governing scope is `in_progress`
  // (Req 9.4, 10.4, 11.3, 12.4); the server remains authoritative and will
  // reject anything else with a 422 surfaced via `failureMessage`.
  const canAnswer = isInProgress && scopeStatus === "in_progress";

  // The countdown has run out but the server has not yet handed back the next
  // Section, so the Questions on screen are stale for a beat.
  const isAwaitingNextSection =
    isSectional && isInProgress && displaySeconds <= 0 && !isCompleted;

  const currentSelection = currentQuestion
    ? (selections[currentQuestion.id] ?? [])
    : [];

  const toggleOption = useCallback(
    (questionId: string, optionId: string, allowMultiple: boolean) => {
      setSelections((previous) => {
        const existing = previous[questionId] ?? [];
        if (!allowMultiple) {
          const next = existing.includes(optionId) ? [] : [optionId];
          return { ...previous, [questionId]: next };
        }
        const next = existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId];
        return { ...previous, [questionId]: next };
      });
    },
    [],
  );

  const handleSaveResponse = useCallback(() => {
    if (currentQuestion === undefined) {
      return;
    }
    onSubmitResponse({
      questionId: currentQuestion.id,
      selectedOptionIds: selections[currentQuestion.id] ?? [],
    });
  }, [currentQuestion, onSubmitResponse, selections]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(visibleQuestions.length - 1, index + 1));
  }, [visibleQuestions.length]);

  // Ending a Section — and finalizing the attempt — are both irreversible, so
  // each is confirmed before the request is sent.
  const handleAdvanceSection = useCallback(() => {
    if (window.confirm(ADVANCE_SECTION_CONFIRM_MESSAGE)) {
      onAdvanceSection();
    }
  }, [onAdvanceSection]);

  const handleSubmit = useCallback(() => {
    if (window.confirm(SUBMIT_TEST_CONFIRM_MESSAGE)) {
      onSubmit();
    }
  }, [onSubmit]);

  const remainingDisplay = formatRemaining(displaySeconds);
  const currentSectionTitle = currentSectionState?.title;

  return (
    <section className={classNames(styles.player, className)}>
      <header className={styles.header}>
        <div className={styles.status}>
          <span className={styles.statusLabel}>{STATUS_LABEL_PREFIX}</span>
          <span
            className={classNames(styles.statusBadge, styles[state.status])}
          >
            {ATTEMPT_STATUS_LABELS[state.status]}
          </span>
        </div>
        <div className={styles.timer}>
          <span className={styles.timerLabel}>
            {currentSectionTitle
              ? `${CURRENT_SECTION_LABEL_PREFIX}: ${currentSectionTitle}`
              : REMAINING_TIME_LABEL}
          </span>
          <span className={styles.timerValue}>{remainingDisplay}</span>
        </div>
        <div className={styles.controls}>
          {isPaused ? (
            <Button
              variant="primary"
              onClick={onResume}
              isLoading={isResuming}
              disabled={isCompleted}
            >
              {RESUME_ACTION_LABEL}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={onPause}
              isLoading={isPausing}
              disabled={!isInProgress}
            >
              {PAUSE_ACTION_LABEL}
            </Button>
          )}
          {/* On any Section but the last, the primary action ends just that
              Section; on the last one it finalizes and scores the attempt. */}
          {isSectional && !isLastSection ? (
            <Button
              variant="primary"
              onClick={handleAdvanceSection}
              isLoading={isAdvancingSection}
              disabled={!isInProgress || scopeStatus !== "in_progress"}
            >
              {ADVANCE_SECTION_LABEL}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isCompleted}
            >
              {SUBMIT_ACTION_LABEL}
            </Button>
          )}
        </div>
      </header>

      {isCompleted ? (
        <p className={classNames(styles.banner, styles.bannerCompleted)}>
          {COMPLETED_MESSAGE}
        </p>
      ) : null}
      {isPaused ? (
        <p className={classNames(styles.banner, styles.bannerPaused)}>
          {PAUSED_MESSAGE}
        </p>
      ) : null}
      {!isCompleted && advancedFromTitle !== null ? (
        <p className={classNames(styles.banner, styles.bannerAdvanced)}>
          {`${SECTION_ADVANCED_MESSAGE_PREFIX} ${advancedFromTitle}.`}
        </p>
      ) : null}
      {isAwaitingNextSection ? (
        <p className={classNames(styles.banner, styles.bannerAdvancing)}>
          {SECTION_ADVANCING_MESSAGE}
        </p>
      ) : null}

      {failureMessage ? (
        <ErrorMessage message={failureMessage} className={styles.feedback} />
      ) : null}

      {state.sections?.length > 0 ? (
        <div className={styles.sections}>
          <span className={styles.sectionsLabel}>
            {SECTIONS_OVERVIEW_LABEL}
          </span>
          <ul className={styles.sectionList}>
            {state.sections.map((section) => {
              const isCurrent = section.sectionId === state.currentSectionId;
              // Under Sequential Sectional Timing a Section the Learner cannot
              // reach right now is locked: either already closed for good, or
              // still queued behind the active one.
              const isLocked = isSectional && !isCurrent;
              return (
                <li
                  key={section.sectionId}
                  className={classNames(
                    styles.sectionItem,
                    isCurrent && styles.sectionItemCurrent,
                    isLocked && styles.sectionItemLocked,
                  )}
                  aria-current={isCurrent || undefined}
                >
                  <span className={styles.sectionTitle}>{section.title}</span>
                  <span
                    className={classNames(
                      styles.sectionStatus,
                      styles[section.status],
                    )}
                  >
                    {ATTEMPT_STATUS_LABELS[section.status]}
                  </span>
                  {/* Under Sectional Timing each Section carries its own clock:
                      the active one counts down, a queued one shows the time it
                      will be given, and a closed one shows what was left. Under
                      Overall Timing the Sections share the single header timer,
                      so per-Section times are omitted to avoid implying
                      independent countdowns. */}
                  {isSectional ? (
                    <span className={styles.sectionTime}>
                      {isCurrent
                        ? formatRemaining(displaySeconds)
                        : formatRemaining(section.remainingSeconds)}
                    </span>
                  ) : null}
                  {isLocked ? (
                    <span className={styles.sectionLocked}>
                      {SECTION_LOCKED_LABEL}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!hasQuestions || currentQuestion === undefined ? (
        <p className={styles.empty}>{NO_QUESTIONS_MESSAGE}</p>
      ) : (
        <div className={styles.body}>
          <nav className={styles.nav} aria-label={QUESTION_LABEL_PREFIX}>
            <ul className={styles.navList}>
              {visibleQuestions.map((question, index) => {
                const answered = (selections[question.id] ?? []).length > 0;
                return (
                  <li key={question.id}>
                    <button
                      type="button"
                      className={classNames(
                        styles.navItem,
                        index === safeIndex && styles.navItemActive,
                        answered && styles.navItemAnswered,
                      )}
                      onClick={() => setCurrentIndex(index)}
                      aria-current={index === safeIndex || undefined}
                    >
                      {index + 1}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.question}>
            <p className={styles.questionProgress}>
              {`${QUESTION_LABEL_PREFIX} ${safeIndex + 1} ${QUESTION_PROGRESS_CONNECTOR} ${visibleQuestions.length}`}
            </p>
            <p className={styles.questionText}>{currentQuestion.text}</p>

            {isSectional && scopeStatus === "completed" ? (
              <p className={styles.sectionClosed}>{SECTION_CLOSED_MESSAGE}</p>
            ) : null}

            <ul className={styles.options}>
              {currentQuestion.options.map((option) => {
                const allowMultiple = currentQuestion.allowMultiple ?? true;
                const checked = currentSelection.includes(option.id);
                return (
                  <li key={option.id} className={styles.option}>
                    <label className={styles.optionLabel}>
                      <input
                        className={styles.optionInput}
                        type={allowMultiple ? "checkbox" : "radio"}
                        name={currentQuestion.id}
                        value={option.id}
                        checked={checked}
                        disabled={!canAnswer}
                        onChange={() =>
                          toggleOption(
                            currentQuestion.id,
                            option.id,
                            allowMultiple,
                          )
                        }
                      />
                      <span className={styles.optionText}>{option.text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className={styles.questionActions}>
              <Button
                variant="secondary"
                onClick={goToPrevious}
                disabled={safeIndex === 0}
              >
                {PREVIOUS_QUESTION_LABEL}
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveResponse}
                isLoading={isSavingResponse}
                disabled={!canAnswer}
              >
                {SAVE_RESPONSE_LABEL}
              </Button>
              <Button
                variant="secondary"
                onClick={goToNext}
                disabled={safeIndex === visibleQuestions.length - 1}
              >
                {NEXT_QUESTION_LABEL}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TestPlayer;
