// Types for the RatingBadge component.

export interface RatingBadgeProps {
  /** The average rating, or `null`/`undefined` when the material is unrated. */
  averageRating?: number | null;
  /** The number of ratings. The badge renders nothing when this is 0. */
  reviewCount?: number;
  /** Visual size, forwarded to the inner stars. Defaults to `"sm"`. */
  size?: "sm" | "md" | "lg";
  /** Optional extra class name applied to the root element. */
  className?: string;
}
