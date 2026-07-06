// Types for the ErrorMessage component (Requirements 1.15, 1.17).

/** Props accepted by the ErrorMessage component. */
export interface ErrorMessageProps {
  /** Short heading describing the failure. Defaults to a generic title. */
  title?: string;
  /**
   * Human-readable explanation of the failure (e.g. "The catalog could not be
   * loaded" or "The request timed out"). Defaults to a generic message.
   */
  message?: string;
  /**
   * Optional retry handler. When provided, a retry button is rendered so the
   * Learner can re-attempt the failed request without losing the current view.
   */
  onRetry?: () => void;
  /** Label for the retry button. Defaults to "Try again". */
  retryLabel?: string;
  /** Optional additional class name applied to the root element. */
  className?: string;
}
