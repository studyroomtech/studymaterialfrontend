// LoadingIndicator component.
//
// Renders an accessible spinner used for the pending-request / >= 500 ms
// loading state surfaced by the API hooks (Req 7.3, 5.2). The parent decides
// when to mount it (e.g. once `isLoading` is true); this component only renders
// the visual + accessible loading affordance and never wipes surrounding view.

import styles from "./LoadingIndicator.module.scss";
import {
  DEFAULT_LOADING_INDICATOR_SIZE,
  DEFAULT_LOADING_LABEL,
} from "./LoadingIndicator.constant";
import type { LoadingIndicatorProps } from "./LoadingIndicator.types";

function LoadingIndicator({
  label = DEFAULT_LOADING_LABEL,
  size = DEFAULT_LOADING_INDICATOR_SIZE,
  fullPanel = false,
  className,
}: LoadingIndicatorProps) {
  const rootClassName = [
    styles.root,
    fullPanel ? styles.fullPanel : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} role="status" aria-live="polite">
      <span
        className={`${styles.spinner} ${styles[size]}`}
        aria-hidden="true"
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default LoadingIndicator;
