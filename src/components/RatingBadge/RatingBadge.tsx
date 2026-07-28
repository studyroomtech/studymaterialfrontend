// RatingBadge — a compact average-rating chip (e.g. "★ 4.6 (18)").
//
// Renders a single filled star, the one-decimal average, and the review count
// in parentheses. Designed for dense placements like home and search cards.
// Renders nothing when the material has no ratings yet (`reviewCount === 0`),
// so an unrated card stays clean.
//
// Styling is authored entirely in `RatingBadge.module.scss` (no inline CSS).

import styles from "./RatingBadge.module.scss";
import type { RatingBadgeProps } from "./RatingBadge.types";

function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function RatingBadge({
  averageRating,
  reviewCount,
  size = "sm",
  className,
}: RatingBadgeProps) {
  // Nothing to show until at least one rating exists.
  if (
    reviewCount === undefined ||
    reviewCount <= 0 ||
    averageRating === null ||
    averageRating === undefined
  ) {
    return null;
  }

  const average = averageRating.toFixed(1);

  return (
    <span
      className={classNames(styles.badge, styles[size], className)}
      aria-label={`Rated ${average} out of 5 from ${reviewCount} review${
        reviewCount === 1 ? "" : "s"
      }`}
    >
      <span className={styles.star} aria-hidden="true">
        ★
      </span>
      <span className={styles.value}>{average}</span>
      <span className={styles.count}>({reviewCount})</span>
    </span>
  );
}

export default RatingBadge;
