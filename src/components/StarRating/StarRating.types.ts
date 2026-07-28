// Types for the reusable StarRating component.

export interface StarRatingProps {
  /** The current rating value (0 = none). Fractional values render partial fill. */
  value: number;
  /**
   * When provided, the component is interactive (a radiogroup of star buttons):
   * clicking or keyboard-selecting a star invokes this with the chosen 1–5
   * value. Omit for a read-only display.
   */
  onChange?: (value: number) => void;
  /** Visual size of the stars. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Disables interaction while keeping the current value visible. */
  disabled?: boolean;
  /** Accessible label for the group (e.g. "Your rating"). */
  ariaLabel?: string;
  /** Optional extra class name applied to the root element. */
  className?: string;
}
