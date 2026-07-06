// ErrorMessage component.
//
// Displays a failed/timed-out request message without wiping the surrounding
// view or user-entered data (Req 7.4, 8.1, 8.2, 3.9, 5.5). The parent keeps its
// current view mounted and renders this inline; an optional retry handler lets
// the Learner re-attempt the failed request.

import styles from "./ErrorMessage.module.scss";
import {
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_ERROR_TITLE,
  DEFAULT_RETRY_LABEL,
} from "./ErrorMessage.constant";
import type { ErrorMessageProps } from "./ErrorMessage.types";

function ErrorMessage({
  title = DEFAULT_ERROR_TITLE,
  message = DEFAULT_ERROR_MESSAGE,
  onRetry,
  retryLabel = DEFAULT_RETRY_LABEL,
  className,
}: ErrorMessageProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName} role="alert">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export default ErrorMessage;
