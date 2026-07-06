// EmptyState component.
//
// Renders a configurable empty-state message for the catalog-empty case
// (Req 3.8) and the no-matching-materials case (Req 4.5). The message is
// supplied by the parent so the same component serves both scenarios.

import styles from "./EmptyState.module.scss";
import { DEFAULT_EMPTY_TITLE } from "./EmptyState.constant";
import type { EmptyStateProps } from "./EmptyState.types";

function EmptyState({
  title = DEFAULT_EMPTY_TITLE,
  message,
  className,
}: EmptyStateProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} role="status">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message??''}</p>
    </div>
  );
}

export default EmptyState;
