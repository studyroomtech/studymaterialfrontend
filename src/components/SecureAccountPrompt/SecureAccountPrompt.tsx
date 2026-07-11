// SecureAccountPrompt component (Requirements 5.1, 5.3).
//
// Presentational only: when the parent decides a signed-in Learner's account is
// Unprotected, it renders this prompt to display the exact copy "Secure your
// account with a password" (Req 5.1) alongside a set-password action the
// Learner can activate (Req 5.3). It does no data fetching and holds no state —
// visibility is controlled entirely by the parent per the protection tri-state
// (unprotected / protected / unknown), so this component simply renders its
// message and forwards the button click to `onSetPassword`.
//
// All styling lives in `SecureAccountPrompt.module.scss` (no inline CSS) and
// the stylesheet consumes the shared theme. The action reuses the shared Button
// component.

import Button from "../Button/Button";
import styles from "./SecureAccountPrompt.module.scss";
import {
  SECURE_ACCOUNT_MESSAGE,
  SET_PASSWORD_ACTION_LABEL,
} from "./SecureAccountPrompt.constant";
import type { SecureAccountPromptProps } from "./SecureAccountPrompt.types";

/**
 * Join a set of class names, dropping any falsy entries.
 * @param names candidate class names (falsy values are ignored).
 * @returns a space-separated className string.
 */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function SecureAccountPrompt({
  onSetPassword,
  className,
}: SecureAccountPromptProps) {
  return (
    <div className={classNames(styles.root, className)} role="status">
      <p className={styles.message}>{SECURE_ACCOUNT_MESSAGE}</p>
      <Button variant="primary" onClick={onSetPassword}>
        {SET_PASSWORD_ACTION_LABEL}
      </Button>
    </div>
  );
}

export default SecureAccountPrompt;
