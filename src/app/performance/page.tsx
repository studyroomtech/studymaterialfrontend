'use client';

// Performance page — the Learner's results across every completed Test Attempt.
//
// Where the history list answers "what have I taken" and the review answers
// "how did this one go", this page answers "am I improving, and where am I
// weak". It renders three things from `usePerformance`:
//
//   - An overview: tests completed, attempts, average and best percentage,
//     accuracy, time spent, and the correct/incorrect/skipped split.
//   - A per-Section ranking by accuracy — the strong/weak signal. Sections the
//     Learner never answered report no accuracy and sort last, since they say
//     nothing either way.
//   - A per-Test trend, one bar per completed attempt oldest first, so retakes
//     (Req 15) read as progress. Each bar links to that attempt's review.
//
// Every figure is computed by the Backend; this page only formats. Percentages
// can be negative under negative marking (Req 13.3) and are printed as
// reported — only bar heights are clamped, since a bar cannot be negative.
//
// While the request is in flight a loading indicator is shown (Req 7.3); on
// failure the report is dropped so no partial or stale analytics are rendered.
// All styling lives in `page.module.scss` (no inline CSS beyond the data-driven
// bar height, which is passed as a custom property).

import Link from 'next/link';

import EmptyState from '@/components/EmptyState/EmptyState';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';
import PercentageBar from '@/components/PercentageBar/PercentageBar';
import { usePerformance } from '@/hooks/api/usePerformance';
import type {
  SectionPerformanceDto,
  TestPerformanceDto,
} from '@/types/testSeries.types';
import { formatDateTime } from '@/utils/date';
import { formatDuration } from '@/utils/duration';

import styles from './page.module.scss';
import {
  ACCURACY_LABEL,
  ATTEMPTS_LABEL,
  ATTEMPT_LABEL,
  ATTEMPT_METER_LABEL_PREFIX,
  AVERAGE_LABEL,
  BEST_LABEL,
  BEST_SHORT_LABEL,
  CORRECT_LABEL,
  HISTORY_HREF,
  HISTORY_LINK_LABEL,
  INCORRECT_LABEL,
  LATEST_SHORT_LABEL,
  MARKS_SUFFIX,
  NO_ACCURACY_LABEL,
  OUT_OF_SEPARATOR,
  OVERVIEW_REGION_LABEL,
  PERCENT_SUFFIX,
  PERFORMANCE_EMPTY_MESSAGE,
  PERFORMANCE_EMPTY_TITLE,
  PERFORMANCE_ERROR_MESSAGE,
  PERFORMANCE_ERROR_TITLE,
  PERFORMANCE_LOADING_LABEL,
  PERFORMANCE_SUBTITLE,
  PERFORMANCE_TITLE,
  REVIEW_PATH_PREFIX,
  SECTIONS_CAPTION,
  SECTIONS_HEADING,
  SECTIONS_REGION_LABEL,
  SECTION_ATTEMPTS_SUFFIX_MANY,
  SECTION_ATTEMPTS_SUFFIX_ONE,
  SECTION_METER_LABEL_PREFIX,
  SKIPPED_LABEL,
  TESTS_CAPTION,
  TESTS_COMPLETED_LABEL,
  TESTS_HEADING,
  TESTS_REGION_LABEL,
  TIME_LABEL,
} from './page.constant';

/** Format a percentage, or a placeholder when there is none to report. */
function formatPercentage(value: number | null): string {
  return value === null ? NO_ACCURACY_LABEL : `${value}${PERCENT_SUFFIX}`;
}

function OverviewFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.figure}>
      <span className={styles.figureLabel}>{label}</span>
      <span className={styles.figureValue}>{value}</span>
    </div>
  );
}

function SectionRow({ section }: { section: SectionPerformanceDto }) {
  const attemptsSuffix =
    section.attemptCount === 1
      ? SECTION_ATTEMPTS_SUFFIX_ONE
      : SECTION_ATTEMPTS_SUFFIX_MANY;

  return (
    <li className={styles.sectionRow}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIdentity}>
          <h3 className={styles.sectionTitle}>{section.title}</h3>
          <span className={styles.sectionTest}>
            {section.testTitle} · {section.attemptCount} {attemptsSuffix}
          </span>
        </div>
        <span className={styles.sectionAccuracy}>
          {formatPercentage(section.accuracy)}
        </span>
      </div>

      <PercentageBar
        percentage={section.accuracy}
        label={`${SECTION_METER_LABEL_PREFIX} ${section.title}`}
      />

      <div className={styles.sectionCounts}>
        <span className={styles.positive}>
          {section.correctCount} {CORRECT_LABEL}
        </span>
        <span className={styles.negative}>
          {section.incorrectCount} {INCORRECT_LABEL}
        </span>
        <span className={styles.muted}>
          {section.unansweredCount} {SKIPPED_LABEL}
        </span>
      </div>
    </li>
  );
}

function TestTrend({ test }: { test: TestPerformanceDto }) {
  return (
    <li className={styles.testCard}>
      <div className={styles.testHeader}>
        <h3 className={styles.testTitle}>{test.testTitle}</h3>
        <span className={styles.testMeta}>
          {BEST_SHORT_LABEL} {test.bestPercentage}
          {PERCENT_SUFFIX} · {LATEST_SHORT_LABEL} {test.latestPercentage}
          {PERCENT_SUFFIX}
        </span>
      </div>

      <ol className={styles.trend}>
        {test.attempts.map((point, index) => (
          <li key={point.attemptId} className={styles.trendItem}>
            <Link
              href={`${REVIEW_PATH_PREFIX}/${point.attemptId}`}
              className={styles.trendLink}
            >
              <span className={styles.trendIndex}>
                {ATTEMPT_LABEL} {index + 1}
              </span>

              <PercentageBar
                percentage={point.percentage}
                label={`${ATTEMPT_METER_LABEL_PREFIX} ${index + 1}`}
              />

              <span className={styles.trendValue}>
                {point.percentage}
                {PERCENT_SUFFIX}
              </span>

              <span className={styles.trendDetail}>
                {point.scoreMarks} {OUT_OF_SEPARATOR} {point.maxMarks}{' '}
                {MARKS_SUFFIX} · {formatDuration(point.timeSpentSeconds)} ·{' '}
                {formatDateTime(point.completedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </li>
  );
}

function PerformancePage() {
  const { performance, isLoading, error, isEmpty } = usePerformance();

  const showLoading = isLoading && performance === null;
  const showError = !isLoading && error !== null;
  const showReport = performance !== null && !isEmpty;

  return (
    <main className={styles.main}>
      <Link href={HISTORY_HREF} className={styles.backLink}>
        {HISTORY_LINK_LABEL}
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{PERFORMANCE_TITLE}</h1>
        <p className={styles.subtitle}>{PERFORMANCE_SUBTITLE}</p>
      </header>

      {showLoading ? (
        <LoadingIndicator fullPanel label={PERFORMANCE_LOADING_LABEL} />
      ) : null}

      {showError ? (
        <ErrorMessage
          title={PERFORMANCE_ERROR_TITLE}
          message={PERFORMANCE_ERROR_MESSAGE}
        />
      ) : null}

      {isEmpty ? (
        <EmptyState
          title={PERFORMANCE_EMPTY_TITLE}
          message={PERFORMANCE_EMPTY_MESSAGE}
        />
      ) : null}

      {showReport ? (
        <>
          <section className={styles.overview} aria-label={OVERVIEW_REGION_LABEL}>
            <div className={styles.figures}>
              <OverviewFigure
                label={TESTS_COMPLETED_LABEL}
                value={`${performance.testsCompleted}`}
              />
              <OverviewFigure
                label={ATTEMPTS_LABEL}
                value={`${performance.totalAttempts}`}
              />
              <OverviewFigure
                label={AVERAGE_LABEL}
                value={`${performance.averagePercentage}${PERCENT_SUFFIX}`}
              />
              <OverviewFigure
                label={BEST_LABEL}
                value={formatPercentage(performance.bestPercentage)}
              />
              <OverviewFigure
                label={ACCURACY_LABEL}
                value={formatPercentage(performance.overallAccuracy)}
              />
              <OverviewFigure
                label={TIME_LABEL}
                value={formatDuration(performance.totalTimeSpentSeconds)}
              />
            </div>

            <div className={styles.overviewCounts}>
              <span className={styles.positive}>
                {performance.correctCount} {CORRECT_LABEL}
              </span>
              <span className={styles.negative}>
                {performance.incorrectCount} {INCORRECT_LABEL}
              </span>
              <span className={styles.muted}>
                {performance.unansweredCount} {SKIPPED_LABEL}
              </span>
            </div>
          </section>

          {performance.sections.length > 0 ? (
            <section
              className={styles.panel}
              aria-label={SECTIONS_REGION_LABEL}
            >
              <div className={styles.panelHeader}>
                <h2 className={styles.panelHeading}>{SECTIONS_HEADING}</h2>
                <p className={styles.panelCaption}>{SECTIONS_CAPTION}</p>
              </div>
              <ul className={styles.sectionList}>
                {performance.sections.map((section) => (
                  <SectionRow key={section.sectionId} section={section} />
                ))}
              </ul>
            </section>
          ) : null}

          {performance.tests.length > 0 ? (
            <section className={styles.panel} aria-label={TESTS_REGION_LABEL}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelHeading}>{TESTS_HEADING}</h2>
                <p className={styles.panelCaption}>{TESTS_CAPTION}</p>
              </div>
              <ul className={styles.testList}>
                {performance.tests.map((test) => (
                  <TestTrend key={test.testId} test={test} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}

export default PerformancePage;
