// Reusable Button component (Requirements 1.2, 1.18, 1.19, 7.5).
//
// Styling is authored entirely in `Button.module.scss` (no inline CSS); the
// stylesheet consumes the shared theme so the Button matches the platform's
// single color palette, typography scale, and spacing scale.

import styles from "./Button.module.scss";
import {
  BUTTON_LOADING_LABEL,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_TYPE,
  DEFAULT_BUTTON_VARIANT,
} from "./Button.constant";
import type { ButtonProps } from "./Button.types";

/**
 * Join a set of class names, dropping any falsy entries.
 * @param names candidate class names (falsy values are ignored).
 * @returns a space-separated className string.
 */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function Button({
  variant = DEFAULT_BUTTON_VARIANT,
  size = DEFAULT_BUTTON_SIZE,
  isLoading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  type = DEFAULT_BUTTON_TYPE,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const rootClassName = classNames(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isLoading && styles.loading,
    className,
  );

  return (
    <button
      type={type}
      className={rootClassName}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        leadingIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leadingIcon}
          </span>
        )
      )}
      <span className={styles.label}>
        {isLoading ? BUTTON_LOADING_LABEL : children}
      </span>
      {!isLoading && trailingIcon && (
        <span className={styles.icon} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
}

export default Button;
