// Reusable StarRating component — StudyForGovt.
//
// Renders a 1–5 star rating in two modes:
//   - Read-only (no `onChange`): a decorative row of stars that fills to the
//     current (possibly fractional) `value`, labeled for assistive tech.
//   - Interactive (`onChange` provided): a keyboard-accessible radiogroup of
//     star buttons for capturing a learner's rating in the review form.
//
// Styling is authored entirely in `StarRating.module.scss` (no inline CSS) and
// consumes the shared theme so stars match the platform's gold/ink palette.

"use client";

import styles from "./StarRating.module.scss";
import { MAX_STARS, STAR_VALUES } from "./StarRating.constant";
import type { StarRatingProps } from "./StarRating.types";

function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/**
 * The filled portion of the star at 1-based `position` for `value`, quantized to
 * the nearest half (0, 50, or 100 percent). Half-star granularity is enough for
 * displaying averages like 4.6 and lets the fill be driven by a CSS class rather
 * than an inline style.
 */
function fillClass(value: number, position: number): string {
  const delta = value - (position - 1);
  if (delta >= 0.75) {
    return styles.fill100;
  }
  if (delta >= 0.25) {
    return styles.fill50;
  }
  return styles.fill0;
}

function Star({ fill }: { fill: string }) {
  return (
    <span className={styles.star} aria-hidden="true">
      <span className={styles.starEmpty}>★</span>
      <span className={`${styles.starFill} ${fill}`}>★</span>
    </span>
  );
}

function StarRating({
  value,
  onChange,
  size = "md",
  disabled = false,
  ariaLabel,
  className,
}: StarRatingProps) {
  const rootClassName = classNames(styles.root, styles[size], className);

  // Read-only display: a single labeled, decorative row of stars.
  if (onChange === undefined) {
    return (
      <span
        className={rootClassName}
        role="img"
        aria-label={ariaLabel ?? `Rated ${value} out of ${MAX_STARS}`}
      >
        {STAR_VALUES.map((position) => (
          <Star key={position} fill={fillClass(value, position)} />
        ))}
      </span>
    );
  }

  // Interactive: a radiogroup of star buttons (click + keyboard selectable).
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) {
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(MAX_STARS, Math.max(1, value) + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, value - 1));
    }
  };

  return (
    <div
      className={classNames(rootClassName, styles.interactive)}
      role="radiogroup"
      aria-label={ariaLabel ?? "Your rating"}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
    >
      {STAR_VALUES.map((position) => {
        const selected = value === position;
        return (
          <button
            key={position}
            type="button"
            className={styles.starButton}
            role="radio"
            aria-checked={selected}
            aria-label={`${position} star${position === 1 ? "" : "s"}`}
            tabIndex={selected || (value === 0 && position === 1) ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(position)}
          >
            <Star fill={fillClass(value, position)} />
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;
