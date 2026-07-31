// PercentageBar — a horizontal meter for a 0–100 figure.
//
// Built on the native `<progress>` element, which carries the value and its
// scale as attributes. That keeps the fill data-driven without an inline style
// and makes the figure available to assistive tech for free.
//
// The rendered value is clamped to the 0–100 scale: a negative percentage is
// real (negative marking can drive a Score below zero, Req 13.3) and callers
// print it as reported, but a bar cannot show a negative fill. An absent value
// renders as an empty bar.
//
// Styling is authored entirely in `PercentageBar.module.scss` (no inline CSS).

import styles from './PercentageBar.module.scss';
import { PERCENTAGE_MAX, PERCENTAGE_MIN } from './PercentageBar.constant';
import type { PercentageBarProps } from './PercentageBar.types';

function PercentageBar({ percentage, label, size = 'sm' }: PercentageBarProps) {
  const value =
    percentage === null
      ? PERCENTAGE_MIN
      : Math.max(PERCENTAGE_MIN, Math.min(PERCENTAGE_MAX, percentage));

  return (
    <progress
      className={`${styles.bar} ${styles[size]}`}
      value={value}
      max={PERCENTAGE_MAX}
      aria-label={label}
    />
  );
}

export default PercentageBar;
