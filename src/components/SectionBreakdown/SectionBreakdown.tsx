// SectionBreakdown — how a completed attempt went, Section by Section.
//
// This is the diagnostic half of a result: the attempt total says how the
// Learner did, the per-Section rows say where. Each Section carries its own
// marking scheme (Req 3.1), so these marks are computed from that Section's own
// Correct/Negative Mark rather than divided out of the total.
//
// Time spent is `null` under Overall Timing, where the whole Test shares one
// clock and no per-Section time exists; the row then shows only the Section's
// Time Limit rather than implying zero seconds were spent.
//
// Renders nothing when there are no Sections, so a caller can drop it in
// unconditionally. Styling is authored entirely in the module stylesheet.

import PercentageBar from '@/components/PercentageBar/PercentageBar';
import { formatDuration } from '@/utils/duration';

import styles from './SectionBreakdown.module.scss';
import {
  ACCURACY_LABEL,
  BREAKDOWN_HEADING,
  BREAKDOWN_REGION_LABEL,
  CORRECT_LABEL,
  INCORRECT_LABEL,
  METER_LABEL_PREFIX,
  NO_ACCURACY_LABEL,
  OUT_OF_SEPARATOR,
  PERCENT_SUFFIX,
  SCORE_LABEL,
  SKIPPED_LABEL,
  TIME_LABEL,
  TIME_OF_LIMIT_SEPARATOR,
} from './SectionBreakdown.constant';
import type { SectionBreakdownProps } from './SectionBreakdown.types';

function SectionBreakdown({ sections }: SectionBreakdownProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section className={styles.breakdown} aria-label={BREAKDOWN_REGION_LABEL}>
      <h2 className={styles.heading}>{BREAKDOWN_HEADING}</h2>

      <ul className={styles.list}>
        {sections.map((section) => {
          return (
            <li key={section.sectionId} className={styles.row}>
              <div className={styles.rowHeader}>
                <h3 className={styles.rowTitle}>{section.title}</h3>
                <span className={styles.rowPercentage}>
                  {section.percentage}
                  {PERCENT_SUFFIX}
                </span>
              </div>

              <PercentageBar
                percentage={section.percentage}
                label={`${METER_LABEL_PREFIX} ${section.title}`}
              />

              <dl className={styles.figures}>
                <div className={styles.figure}>
                  <dt className={styles.figureLabel}>{SCORE_LABEL}</dt>
                  <dd className={styles.figureValue}>
                    {section.scoreMarks} {OUT_OF_SEPARATOR} {section.maxMarks}
                  </dd>
                </div>

                <div className={styles.figure}>
                  <dt className={styles.figureLabel}>{ACCURACY_LABEL}</dt>
                  <dd className={styles.figureValue}>
                    {section.accuracy === null
                      ? NO_ACCURACY_LABEL
                      : `${section.accuracy}${PERCENT_SUFFIX}`}
                  </dd>
                </div>

                <div className={styles.figure}>
                  <dt className={styles.figureLabel}>{TIME_LABEL}</dt>
                  <dd className={styles.figureValue}>
                    {section.timeSpentSeconds === null
                      ? formatDuration(section.timeLimitSeconds)
                      : `${formatDuration(section.timeSpentSeconds)} ${TIME_OF_LIMIT_SEPARATOR} ${formatDuration(section.timeLimitSeconds)}`}
                  </dd>
                </div>

                <div className={styles.figure}>
                  <dt className={styles.figureLabel}>{CORRECT_LABEL}</dt>
                  <dd className={`${styles.figureValue} ${styles.positive}`}>
                    {section.correctCount}
                  </dd>
                </div>

                <div className={styles.figure}>
                  <dt className={styles.figureLabel}>{INCORRECT_LABEL}</dt>
                  <dd className={`${styles.figureValue} ${styles.negative}`}>
                    {section.incorrectCount}
                  </dd>
                </div>

                <div className={styles.figure}>
                  <dt className={styles.figureLabel}>{SKIPPED_LABEL}</dt>
                  <dd className={styles.figureValue}>
                    {section.unansweredCount}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default SectionBreakdown;
