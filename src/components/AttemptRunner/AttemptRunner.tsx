'use client';

// AttemptRunner component (task 18.4) — Req 8.1, 8.2, 9.1, 11.4, 12.7, 15.1.
//
// The shared client surface behind both attempt routes (`app/tests/[id]` and
// `app/sections/[id]`). It owns a single `useAttempt` lifecycle for one scope:
// on mount it starts/resumes the attempt (a whole Test via `start`, or a single
// Section via `startSection`), then renders the presentational `TestPlayer`
// wired to the hook's pause/resume/respond/submit actions. The server owns every
// timing/scoring/access decision — the runner only renders the
// server-authoritative `AttemptStateDto` and reacts to the mapped
// `AttemptOutcome`.
//
// Navigation to the review page (`/attempts/:attemptId`, Req 14.2) happens only
// when the server reports the attempt `completed`. That distinction is what
// makes Sequential Sectional Timing work: a Section running out or being
// submitted early normally just opens the next Section and the Learner stays
// in the player, and only the final Section closing ends the attempt.
//
// Question content: the attempt start/state endpoints return an
// `AttemptStateDto` carrying per-Section status/timing only, so once the attempt
// has started the runner fetches the in-scope Question content from the
// learner-facing `GET /api/attempts/:id/questions` endpoint (via
// `useAttemptQuestions`) and hands it to the `TestPlayer` along with the
// Learner's currently recorded selections. All styling lives in
// `AttemptRunner.module.scss` (no inline CSS); constants live in the sibling
// `AttemptRunner.constant.ts`.

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useAttempt } from '@/hooks/api/useAttempt';
import { useAttemptQuestions } from '@/hooks/api/useAttemptQuestions';
import type { TestPlayerQuestion } from '@/components/TestPlayer/TestPlayer.types';

import EmptyState from '../EmptyState/EmptyState';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import TestPlayer from '../TestPlayer/TestPlayer';
import styles from './AttemptRunner.module.scss';
import {
  AUTH_REQUIRED_MESSAGE,
  AUTH_REQUIRED_TITLE,
  NOT_FOUND_MESSAGE,
  NOT_FOUND_TITLE,
  PAYMENT_REQUIRED_MESSAGE,
  PAYMENT_REQUIRED_TITLE,
  RETRY_LABEL,
  REVIEW_PATH_PREFIX,
  START_ERROR_MESSAGE,
  START_ERROR_TITLE,
  STARTING_LABEL,
} from './AttemptRunner.constant';
import type { AttemptRunnerProps } from './AttemptRunner.types';

function AttemptRunner({ scope, id }: AttemptRunnerProps) {
  const router = useRouter();
  const {
    state,
    start,
    startSection,
    syncState,
    advanceSection,
    pause,
    resume,
    submitResponse,
    submit,
    isStarting,
    isPausing,
    isResuming,
    isAdvancingSection,
    isSavingResponse,
    isSubmitting,
    outcome,
    failureMessage,
  } = useAttempt();
  const { questions: attemptQuestions, loadQuestions } = useAttemptQuestions();

  // Start (or resume) the attempt for this scope. Kept in a callback so both the
  // mount effect and the failure-retry action can invoke it. The server returns
  // an existing in_progress/paused attempt rather than creating a duplicate
  // (Req 9.5), so re-invoking is safe.
  const startAttempt = useCallback(() => {
    void (scope === 'test' ? start(id) : startSection(id));
  }, [scope, id, start, startSection]);

  // Kick off the attempt once per id when the route mounts (Req 9.1).
  const startedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (id.length === 0 || startedForRef.current === id) {
      return;
    }
    startedForRef.current = id;
    startAttempt();
  }, [id, startAttempt]);

  // Finalize the attempt, then navigate to the review page once the server
  // returns the completed result (Req 11.4, 12.7, 14.2).
  const handleSubmit = useCallback(async () => {
    const result = await submit();
    if (result !== null) {
      router.push(`${REVIEW_PATH_PREFIX}/${result.attemptId}`);
    }
  }, [submit, router]);

  // The player's countdown reached zero (or its background poll came due). Ask
  // the server what that means rather than assuming the attempt is over: under
  // Sequential Sectional Timing an expired Section usually just hands over to
  // the next one, and only the last Section ending finalizes the attempt. This
  // is what previously submitted the whole test the moment any Section expired.
  const handleTimeExpired = useCallback(async () => {
    const refreshed = await syncState();
    if (refreshed?.status === 'completed') {
      router.push(`${REVIEW_PATH_PREFIX}/${refreshed.attemptId}`);
    }
  }, [syncState, router]);

  // "Submit section & continue": close the active Section early. The server
  // returns the next Section's state, or a completed attempt when that was the
  // last Section — in which case the Learner goes straight to the review.
  const handleAdvanceSection = useCallback(async () => {
    const refreshed = await advanceSection();
    if (refreshed?.status === 'completed') {
      router.push(`${REVIEW_PATH_PREFIX}/${refreshed.attemptId}`);
    }
  }, [advanceSection, router]);

  // The player holds these in effect dependency lists (the expiry watcher and
  // the background state poll), so they must keep a stable identity — an inline
  // arrow would tear down and restart the poll on every render, and it would
  // never actually fire.
  const submitHandler = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);
  const timeExpiredHandler = useCallback(() => {
    void handleTimeExpired();
  }, [handleTimeExpired]);
  const advanceSectionHandler = useCallback(() => {
    void handleAdvanceSection();
  }, [handleAdvanceSection]);

  // Once the attempt has started/resumed, load its in-scope Question content for
  // the player, once per attempt id (Req 9.4).
  const loadedQuestionsForRef = useRef<string | null>(null);
  const attemptId = state?.attemptId;
  useEffect(() => {
    if (attemptId === undefined || loadedQuestionsForRef.current === attemptId) {
      return;
    }
    loadedQuestionsForRef.current = attemptId;
    void loadQuestions(attemptId);
  }, [attemptId, loadQuestions]);

  // Map the fetched Question content to the player's shape and seed the
  // Learner's prior selections so a resumed attempt shows recorded answers.
  const playerQuestions = useMemo<TestPlayerQuestion[]>(
    () =>
      attemptQuestions.map((question) => ({
        id: question.questionId,
        sectionId: question.sectionId,
        text: question.text,
        options: question.options,
      })),
    [attemptQuestions],
  );
  const initialSelections = useMemo<Record<string, string[]>>(() => {
    const seed: Record<string, string[]> = {};
    for (const question of attemptQuestions) {
      seed[question.questionId] = question.selectedOptionIds;
    }
    return seed;
  }, [attemptQuestions]);

  // Before any attempt state is available, surface the loading affordance or the
  // mapped failure outcome (auth/payment/not-found/invalid/error).
  if (state === null) {
    if (isStarting) {
      return (
        <main className={styles.main}>
          <LoadingIndicator fullPanel label={STARTING_LABEL} />
        </main>
      );
    }

    if (outcome === 'payment_required') {
      return (
        <main className={styles.main}>
          <EmptyState
            title={PAYMENT_REQUIRED_TITLE}
            message={failureMessage ?? PAYMENT_REQUIRED_MESSAGE}
          />
        </main>
      );
    }

    if (outcome === 'auth_required') {
      return (
        <main className={styles.main}>
          <ErrorMessage
            title={AUTH_REQUIRED_TITLE}
            message={failureMessage ?? AUTH_REQUIRED_MESSAGE}
            onRetry={startAttempt}
            retryLabel={RETRY_LABEL}
          />
        </main>
      );
    }

    if (outcome === 'not_found') {
      return (
        <main className={styles.main}>
          <EmptyState title={NOT_FOUND_TITLE} message={NOT_FOUND_MESSAGE} />
        </main>
      );
    }

    // `invalid`, `error`, or an as-yet-unsettled start: offer a retry without
    // partial content.
    return (
      <main className={styles.main}>
        <ErrorMessage
          title={START_ERROR_TITLE}
          message={failureMessage ?? START_ERROR_MESSAGE}
          onRetry={startAttempt}
          retryLabel={RETRY_LABEL}
        />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <TestPlayer
        state={state}
        questions={playerQuestions}
        initialSelections={initialSelections}
        onSubmitResponse={submitResponse}
        onPause={pause}
        onResume={resume}
        onSubmit={submitHandler}
        onTimeExpired={timeExpiredHandler}
        onAdvanceSection={advanceSectionHandler}
        isPausing={isPausing}
        isResuming={isResuming}
        isAdvancingSection={isAdvancingSection}
        isSavingResponse={isSavingResponse}
        isSubmitting={isSubmitting}
        failureMessage={failureMessage}
      />
    </main>
  );
}

export default AttemptRunner;
