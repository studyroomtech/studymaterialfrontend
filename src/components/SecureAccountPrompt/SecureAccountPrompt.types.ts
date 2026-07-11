// Types for the SecureAccountPrompt component (Requirements 5.1, 5.3).

/** Props accepted by the SecureAccountPrompt component. */
export interface SecureAccountPromptProps {
  /**
   * Invoked when the Learner activates the set-password action (Req 5.3). The
   * parent owns what happens next (e.g. opening the set-password modal); this
   * component is presentational and only signals the intent.
   */
  onSetPassword: () => void;
  /** Optional additional class name merged onto the root element. */
  className?: string;
}
