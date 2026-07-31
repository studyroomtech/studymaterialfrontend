'use client';

// Attempt history page (Req 14.1, 14.5).
//
// Lists the signed-in Learner's completed Test Attempts via `useAttemptHistory`,
// each showing the Test title, total Score as decimal marks, and completion
// time, and each linking to its review page (`/attempts/:id`, Req 14.2).
//
//   - While the history request is in flight, a loading indicator is shown
//     (Req 7.3) with no empty-state.
//   - On failure the hook surfaces an empty list plus a typed error, so an
//     error message is rendered with no partial or stale history.
//   - On a settled, error-free load with no completed attempts, an empty-state
//     message indicates there are no past tests (Req 14.5).
//
// Score is already decimal marks and completion time is an ISO 8601 UTC `Z`
// string, formatted via the shared `formatDateTime` util. All styling lives in
// `page.module.scss` (no inline CSS); constants live in `page.constant.ts`.

import Link from 'next/link';

import EmptyState from '@/components/EmptyState/EmptyState';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import { useAttemptHistory } from '@/hooks/api/useAttemptHistory';
import { formatDateTime } from '@/utils/date';

import styles from './page.module.scss';
import {
  ACCURACY_LABEL,
  COMPLETED_AT_LABEL,
  HISTORY_EMPTY_MESSAGE,
  HISTORY_EMPTY_TITLE,
  HISTORY_ERROR_MESSAGE,
  HISTORY_ERROR_TITLE,
  HISTORY_LOADING_LABEL,
  HISTORY_RESULTS_LABEL,
  HISTORY_SUBTITLE,
  HISTORY_TITLE,
  MARKS_SUFFIX,
  NO_ACCURACY_LABEL,
  OUT_OF_SEPARATOR,
  PERCENTAGE_LABEL,
  PERCENT_SUFFIX,
  PERFORMANCE_HREF,
  PERFORMANCE_LINK_LABEL,
  REVIEW_ACTION_LABEL,
  REVIEW_PATH_PREFIX,
  SCORE_LABEL,
} from './page.constant';

function AttemptHistoryPage() {
  const { attempts, isHistoryLoading, historyError, isHistoryEmpty } =
    useAttemptHistory();

  // Replace the whole panel with the loading affordance only before the first
  // settled load; once loaded, the list (or empty/error state) takes over.
  const showLoading = isHistoryLoading && attempts.length === 0;
  const showError = historyError !== null && !isHistoryLoading;
  const showResults = attempts.length > 0;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{HISTORY_TITLE}</h1>
        <p className={styles.subtitle}>{HISTORY_SUBTITLE}</p>
        {/* Only worth offering once there is something to analyze. */}
        {showResults ? (
          <Link href={PERFORMANCE_HREF} className={styles.performanceLink}>
            {PERFORMANCE_LINK_LABEL}
          </Link>
        ) : null}
      </header>

      <section className={styles.results} aria-label={HISTORY_RESULTS_LABEL}>
        {showLoading ? (
          <LoadingIndicator fullPanel label={HISTORY_LOADING_LABEL} />
        ) : null}

        {showError ? (
          <ErrorMessage
            title={HISTORY_ERROR_TITLE}
            message={HISTORY_ERROR_MESSAGE}
          />
        ) : null}

        {isHistoryEmpty ? (
          <EmptyState
            title={HISTORY_EMPTY_TITLE}
            message={HISTORY_EMPTY_MESSAGE}
          />
        ) : null}

        {showResults ? (
          <ul className={styles.list}>
            {attempts.map((attempt) => (
              <li key={attempt.attemptId} className={styles.item}>
                <Link
                  href={`${REVIEW_PATH_PREFIX}/${attempt.attemptId}`}
                  className={styles.card}
                >
                  <h2 className={styles.cardTitle}>{attempt.testTitle}</h2>

                  <div className={styles.meta}>
                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>{SCORE_LABEL}</span>
                      <span className={styles.metaValue}>
                        {attempt.scoreMarks} {OUT_OF_SEPARATOR}{' '}
                        {attempt.summary.maxMarks} {MARKS_SUFFIX}
                      </span>
                    </span>

                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>
                        {PERCENTAGE_LABEL}
                      </span>
                      <span className={styles.metaValue}>
                        {attempt.summary.percentage}
                        {PERCENT_SUFFIX}
                      </span>
                    </span>

                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>{ACCURACY_LABEL}</span>
                      <span className={styles.metaValue}>
                        {attempt.summary.accuracy === null
                          ? NO_ACCURACY_LABEL
                          : `${attempt.summary.accuracy}${PERCENT_SUFFIX}`}
                      </span>
                    </span>

                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>
                        {COMPLETED_AT_LABEL}
                      </span>
                      <span className={styles.metaValue}>
                        {formatDateTime(attempt.completedAt)}
                      </span>
                    </span>
                  </div>

                  <span className={styles.reviewAction}>
                    {REVIEW_ACTION_LABEL}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}

export default AttemptHistoryPage;
