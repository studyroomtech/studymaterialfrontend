// Reusable, accessible Input component (Requirements 1.2, 1.18, 1.19, 7.5).
//
// Renders a labelled text input with optional hint and error messaging. All
// styling lives in `Input.module.scss` (no inline CSS) and derives from the
// shared theme. The label is always present for assistive technologies and can
// be visually hidden via `hideLabel` when a surrounding context supplies it.

import styles from "./Input.module.scss";
import type { InputProps } from "./Input.types";

/**
 * Join a set of class names, dropping any falsy entries.
 * @param names candidate class names (falsy values are ignored).
 * @returns a space-separated className string.
 */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function Input({
  id,
  label,
  hideLabel = false,
  inputSize = "md",
  error,
  hint,
  leadingIcon,
  className,
  disabled,
  ...rest
}: InputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = classNames(hintId, errorId) || undefined;

  const labelClassName = classNames(
    styles.label,
    hideLabel && styles.labelHidden,
  );

  const fieldClassName = classNames(
    styles.field,
    styles[inputSize],
    !!error && styles.fieldError,
    disabled && styles.fieldDisabled,
  );

  return (
    <div className={classNames(styles.wrapper, className)}>
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>

      <div className={fieldClassName}>
        {leadingIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          className={styles.input}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
