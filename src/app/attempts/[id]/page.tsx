'use client';

// Attempt review page (Req 14.2).
//
// Loads one owner-scoped completed Test Attempt via `useAttemptHistory`'s
// `loadReview(id)` and renders, for each Question, the Question text, its
// Options, the Correct Option Set, and the Learner's recorded Response.
//
//   - While the review request is in flight, a loading indicator is shown
//     (Req 7.3).
//   - On failure (including a `404` for an attempt that is not the caller's,
//     Req 14.4) the hook drops any stale review and surfaces a typed error, so
//     an error message is rendered with no partial or stale content.
//
// Each Option is annotated when it is part of the Correct Option Set and/or was
// selected by the Learner; an unanswered Question is called out explicitly.
// Score is decimal marks and completion time an ISO 8601 UTC `Z` string,
// formatted via the shared `formatDateTime` util. All styling lives in
// `page.module.scss` (no inline CSS); constants live in `page.constant.ts`.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import ResultSummary from '@/components/ResultSummary/ResultSummary';
import SectionBreakdown from '@/components/SectionBreakdown/SectionBreakdown';
import { useAttemptHistory } from '@/hooks/api/useAttemptHistory';
import type { ReviewQuestionDto } from '@/types/testSeries.types';
import { formatDateTime } from '@/utils/date';

import styles from './page.module.scss';
import {
  BACK_TO_HISTORY_LABEL,
  COMPLETED_AT_LABEL,
  CORRECT_OPTION_BADGE,
  HISTORY_HREF,
  INVALID_ID_MESSAGE,
  PERFORMANCE_HREF,
  PERFORMANCE_LINK_LABEL,
  QUESTION_LABEL_PREFIX,
  QUESTIONS_HEADING,
  REVIEW_ERROR_MESSAGE,
  REVIEW_ERROR_TITLE,
  REVIEW_LOADING_LABEL,
  UNANSWERED_LABEL,
  YOUR_ANSWER_BADGE,
} from './page.constant';

/**
 * Resolve the attempt id from the dynamic route params. A catch-all/array value
 * is narrowed to its first entry; an absent id yields an empty string.
 * @param rawId the raw `id` route param.
 * @returns the attempt id, or an empty string when none is present.
 */
function resolveAttemptId(rawId: string | string[] | undefined): string {
  if (typeof rawId === 'string') {
    return rawId;
  }
  if (Array.isArray(rawId)) {
    return rawId[0] ?? '';
  }
  return '';
}

function ReviewQuestion({
  question,
  index,
}: {
  question: ReviewQuestionDto;
  index: number;
}) {
  const correctIds = new Set(question.correctOptionIds);
  const selectedIds = new Set(question.selectedOptionIds);
  const isUnanswered = question.selectedOptionIds.length === 0;

  return (
    <li className={styles.question}>
      <div className={styles.questionHeader}>
        <span className={styles.questionIndex}>
          {QUESTION_LABEL_PREFIX} {index + 1}
        </span>
        <p className={styles.questionText}>{question.text}</p>
      </div>

      <ul className={styles.optionList}>
        {question.options.map((option) => {
          const isCorrect = correctIds.has(option.id);
          const isSelected = selectedIds.has(option.id);
          const optionClassName = [
            styles.option,
            isCorrect ? styles.optionCorrect : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li key={option.id} className={optionClassName}>
              <span className={styles.optionText}>{option.text}</span>
              <span className={styles.badges}>
                {isCorrect ? (
                  <span className={`${styles.badge} ${styles.badgeCorrect}`}>
                    {CORRECT_OPTION_BADGE}
                  </span>
                ) : null}
                {isSelected ? (
                  <span className={`${styles.badge} ${styles.badgeSelected}`}>
                    {YOUR_ANSWER_BADGE}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>

      {isUnanswered ? (
        <p className={styles.unanswered}>{UNANSWERED_LABEL}</p>
      ) : null}
    </li>
  );
}

function AttemptReviewPage() {
  const params = useParams();
  const attemptId = resolveAttemptId(params?.id);
  const hasId = attemptId.length > 0;

  const { review, isReviewLoading, reviewError, loadReview } =
    useAttemptHistory();

  // Load the owner-scoped review once per attempt id (Req 14.2). The hook drops
  // any previously loaded review on failure so no stale review is shown.
  useEffect(() => {
    if (hasId) {
      void loadReview(attemptId);
    }
  }, [hasId, attemptId, loadReview]);

  // No id in the route: nothing can be loaded (no partial content).
  if (!hasId) {
    return (
      <main className={styles.main}>
        <Link href={HISTORY_HREF} className={styles.backLink}>
          {BACK_TO_HISTORY_LABEL}
        </Link>
        <ErrorMessage title={REVIEW_ERROR_TITLE} message={INVALID_ID_MESSAGE} />
      </main>
    );
  }

  const showLoading = isReviewLoading && review === null;
  const showError = !isReviewLoading && reviewError !== null;
  const showReview = review !== null;

  return (
    <main className={styles.main}>
      <Link href={HISTORY_HREF} className={styles.backLink}>
        {BACK_TO_HISTORY_LABEL}
      </Link>

      {showLoading ? (
        <LoadingIndicator fullPanel label={REVIEW_LOADING_LABEL} />
      ) : null}

      {showError ? (
        <ErrorMessage
          title={REVIEW_ERROR_TITLE}
          message={REVIEW_ERROR_MESSAGE}
        />
      ) : null}

      {showReview ? (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>{review.testTitle}</h1>
            <div className={styles.headerMeta}>
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>{COMPLETED_AT_LABEL}</span>
                <span className={styles.metaValue}>
                  {formatDateTime(review.completedAt)}
                </span>
              </span>
              <Link href={PERFORMANCE_HREF} className={styles.performanceLink}>
                {PERFORMANCE_LINK_LABEL}
              </Link>
            </div>
          </header>

          <ResultSummary summary={review.summary} />

          <SectionBreakdown sections={review.sections} />

          <h2 className={styles.questionsHeading}>{QUESTIONS_HEADING}</h2>
          <ul className={styles.questionList}>
            {review.questions.map((question, index) => (
              <ReviewQuestion
                key={question.questionId}
                question={question}
                index={index}
              />
            ))}
          </ul>
        </>
      ) : null}
    </main>
  );
}

export default AttemptReviewPage;
