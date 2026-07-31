// Type declarations for the PercentageBar component.

export interface PercentageBarProps {
  /**
   * The percentage to visualize. May be negative (negative marking can drive a
   * Score below zero, Req 13.3) or absent; both render as an empty bar.
   */
  percentage: number | null;
  /** Accessible label describing what the bar measures. */
  label: string;
  /** Bar thickness. `md` for a headline figure, `sm` for a dense row. */
  size?: 'sm' | 'md';
}
