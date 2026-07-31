// ResultSummary — the headline result of one completed Test Attempt.
//
// Shows the Score against the marks that were obtainable, the resulting
// percentage with a meter, accuracy over answered Questions, time taken, and
// the correct/incorrect/skipped breakdown. A bare mark total says nothing on
// its own; `maxMarks` is what makes it readable.
//
// Two values are deliberately not normalized away:
//   - `percentage` can be negative under negative marking (Req 13.3). It is
//     printed as reported; only the meter clamps it, since a bar cannot show a
//     negative fill.
//   - `accuracy` is `null` when nothing was answered, which is not the same as
//     0% — it is shown as a placeholder rather than a zero.
//
// Styling is authored entirely in `ResultSummary.module.scss` (no inline CSS).

import PercentageBar from '@/components/PercentageBar/PercentageBar';
import { formatDuration } from '@/utils/duration';

import styles from './ResultSummary.module.scss';
import {
  ACCURACY_LABEL,
  CORRECT_LABEL,
  INCORRECT_LABEL,
  MARKS_SUFFIX,
  METER_LABEL,
  NO_ACCURACY_LABEL,
  OUT_OF_SEPARATOR,
  PERCENTAGE_LABEL,
  PERCENT_SUFFIX,
  SCORE_LABEL,
  SKIPPED_LABEL,
  SUMMARY_REGION_LABEL,
  TIME_SPENT_LABEL,
} from './ResultSummary.constant';
import type { BreakdownStat, ResultSummaryProps } from './ResultSummary.types';

function ResultSummary({ summary }: ResultSummaryProps) {
  const {
    scoreMarks,
    maxMarks,
    percentage,
    accuracy,
    timeSpentSeconds,
    correctCount,
    incorrectCount,
    unansweredCount,
  } = summary;

  const stats: BreakdownStat[] = [
    { label: CORRECT_LABEL, value: correctCount, tone: 'positive' },
    { label: INCORRECT_LABEL, value: incorrectCount, tone: 'negative' },
    { label: SKIPPED_LABEL, value: unansweredCount, tone: 'neutral' },
  ];

  return (
    <section className={styles.summary} aria-label={SUMMARY_REGION_LABEL}>
      <div className={styles.headline}>
        <div className={styles.figure}>
          <span className={styles.figureLabel}>{SCORE_LABEL}</span>
          <span className={styles.figureValue}>
            {scoreMarks} <span className={styles.figureUnit}>{OUT_OF_SEPARATOR} {maxMarks} {MARKS_SUFFIX}</span>
          </span>
        </div>

        <div className={styles.figure}>
          <span className={styles.figureLabel}>{PERCENTAGE_LABEL}</span>
          <span className={styles.figureValue}>
            {percentage}
            {PERCENT_SUFFIX}
          </span>
        </div>

        <div className={styles.figure}>
          <span className={styles.figureLabel}>{ACCURACY_LABEL}</span>
          <span className={styles.figureValue}>
            {accuracy === null ? (
              NO_ACCURACY_LABEL
            ) : (
              <>
                {accuracy}
                {PERCENT_SUFFIX}
              </>
            )}
          </span>
        </div>

        <div className={styles.figure}>
          <span className={styles.figureLabel}>{TIME_SPENT_LABEL}</span>
          <span className={styles.figureValue}>
            {formatDuration(timeSpentSeconds)}
          </span>
        </div>
      </div>

      <PercentageBar percentage={percentage} label={METER_LABEL} size="md" />

      <ul className={styles.stats}>
        {stats.map((stat) => (
          <li key={stat.label} className={styles.stat}>
            <span className={`${styles.statValue} ${styles[stat.tone]}`}>
              {stat.value}
            </span>
            <span className={styles.statLabel}>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ResultSummary;
