"use client";

// TestPlayer component (Req 9.3, 9.4, 10.1, 10.3, 11.1, 12.5).
//
// A presentational player for a Test Attempt. It is driven entirely by the
// server-authoritative `AttemptStateDto` supplied by the parent (task 18.4,
// wiring `useAttempt`): it renders the server-computed remaining time and the
// Attempt/Section status as-is, provides Question navigation, option selection
// that calls `submitResponse`, pause/resume controls, and a submit action —
// deferring every timing/scoring decision to the server. There is deliberately
// no client countdown as the source of truth (Req 9.2, 9.3): the remaining time
// shown is the value the server last returned, and the view refreshes when the
// parent hands down a new `AttemptStateDto`.
//
// All styling lives in `TestPlayer.module.scss` (no inline CSS) and consumes
// the shared theme via the sibling `Button`, `ErrorMessage`, and `EmptyState`
// components where useful.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "../Button/Button";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import type {
  AttemptStatus,
  SectionStateDto,
} from "../../types/testSeries.types";
import styles from "./TestPlayer.module.scss";
import {
  ATTEMPT_STATUS_LABELS,
  COMPLETED_MESSAGE,
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
  SECTION_CLOSED_MESSAGE,
  SECTIONS_OVERVIEW_LABEL,
  STATUS_LABEL_PREFIX,
  SUBMIT_ACTION_LABEL,
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
  isPausing = false,
  isResuming = false,
  isSavingResponse = false,
  isSubmitting = false,
  failureMessage,
  className,
}: TestPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selections, setSelections] = useState<Record<string, string[]>>(
    () => ({ ...(initialSelections ?? {}) }),
  );

  const isSectional = state.timingMode === "sectional";
  const isCompleted = state.status === "completed";
  const isPaused = state.status === "paused";
  const isInProgress = state.status === "in_progress";

  // Index the per-Section state so the current Question's scope status and
  // remaining time can be resolved under Sectional Timing (Req 12.5).
  const sectionStateById = useMemo<Record<string, SectionStateDto>>(() => {
    const map: Record<string, SectionStateDto> = {};
    for (const section of state.sections ?? []) {
      map[section.sectionId] = section;
    }
    return map;
  }, [state.sections]);

  const hasQuestions = questions.length > 0;
  const safeIndex = hasQuestions
    ? Math.min(currentIndex, questions.length - 1)
    : 0;
  const currentQuestion = hasQuestions ? questions[safeIndex] : undefined;

  // Resolve the status/remaining time of the scope that governs the current
  // Question: the Section Attempt under Sectional Timing, else the Test Attempt.
  const currentSectionState = currentQuestion
    ? sectionStateById[currentQuestion.sectionId]
    : undefined;
  const scopeStatus: AttemptStatus =
    isSectional && currentSectionState
      ? currentSectionState.status
      : state.status;
  // The server-authoritative remaining time for the governing scope. This is
  // the value the client countdown seeds from on every fresh API response.
  const serverRemainingSeconds =
    isSectional && currentSectionState
      ? currentSectionState.remainingSeconds
      : state.remainingSeconds;

  // Identifies the scope whose timer is displayed, so the countdown re-seeds
  // when the governing scope changes (e.g. navigating to a Question in another
  // Section under Sectional Timing).
  const scopeKey =
    isSectional && currentSectionState
      ? currentSectionState.sectionId
      : state.attemptId;

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

  // Guard so the timeout auto-submit fires exactly once per run. Reset whenever
  // the server hands down a fresh positive remaining time (start/resume), so a
  // later expiry can trigger the submit again.
  const autoSubmittedRef = useRef<boolean>(false);
  useEffect(() => {
    if (serverRemainingSeconds > 0) {
      autoSubmittedRef.current = false;
    }
  }, [serverRemainingSeconds, scopeKey]);

  // When the countdown reaches zero while the attempt is still in progress,
  // auto-submit the attempt once. The server stays authoritative and finalizes
  // + scores it; the parent navigates to the review on success.
  useEffect(() => {
    if (displaySeconds > 0 || !isInProgress || autoSubmittedRef.current) {
      return;
    }
    autoSubmittedRef.current = true;
    onSubmit();
  }, [displaySeconds, isInProgress, onSubmit]);

  // Responses are accepted only while the governing scope is `in_progress`
  // (Req 9.4, 10.4, 11.3, 12.4); the server remains authoritative and will
  // reject anything else with a 422 surfaced via `failureMessage`.
  const canAnswer = isInProgress && scopeStatus === "in_progress";

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
    setCurrentIndex((index) => Math.min(questions.length - 1, index + 1));
  }, [questions.length]);

  const remainingDisplay = formatRemaining(displaySeconds);

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
          <span className={styles.timerLabel}>{REMAINING_TIME_LABEL}</span>
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
          <Button
            variant="primary"
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={isCompleted}
          >
            {SUBMIT_ACTION_LABEL}
          </Button>
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

      {failureMessage ? (
        <ErrorMessage message={failureMessage} className={styles.feedback} />
      ) : null}

      {state.sections?.length > 0 ? (
        <div className={styles.sections}>
          <span className={styles.sectionsLabel}>
            {SECTIONS_OVERVIEW_LABEL}
          </span>
          <ul className={styles.sectionList}>
            {state.sections.map((section) => (
              <li key={section.sectionId} className={styles.sectionItem}>
                <span
                  className={classNames(
                    styles.sectionStatus,
                    styles[section.status],
                  )}
                >
                  {ATTEMPT_STATUS_LABELS[section.status]}
                </span>
                {/* Under Sectional Timing each Section runs its own timer;
                    under Overall Timing the Sections share the single attempt
                    timer shown in the header, so the per-Section time is
                    omitted to avoid implying independent countdowns. */}
                {isSectional ? (
                  <span className={styles.sectionTime}>
                    {formatRemaining(section.remainingSeconds)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasQuestions || currentQuestion === undefined ? (
        <p className={styles.empty}>{NO_QUESTIONS_MESSAGE}</p>
      ) : (
        <div className={styles.body}>
          <nav className={styles.nav} aria-label={QUESTION_LABEL_PREFIX}>
            <ul className={styles.navList}>
              {questions.map((question, index) => {
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
              {`${QUESTION_LABEL_PREFIX} ${safeIndex + 1} ${QUESTION_PROGRESS_CONNECTOR} ${questions.length}`}
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
                disabled={safeIndex === questions.length - 1}
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
