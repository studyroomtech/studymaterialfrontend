// Types for the EmptyState component (Requirements 1.15, 1.17).

/** Props accepted by the EmptyState component. */
export interface EmptyStateProps {
  /** Optional heading. Defaults to a generic empty title. */
  title?: string;
  /**
   * The empty-state message to display, e.g. the catalog-empty message
   * (Req 3.8) or the no-matching-materials message (Req 4.5).
   */
  message?: string;
  /** Optional additional class name applied to the root element. */
  className?: string;
}
