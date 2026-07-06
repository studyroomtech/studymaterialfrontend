// Type declarations for the DownloadGateModal component (Requirements 1.15, 6.1, 6.7).

/**
 * The validated Download Gate values handed back to the caller on submit. Both
 * fields are trimmed before being emitted so the caller receives the exact
 * values that will be sent to the Backend API (Req 6.2).
 */
export interface DownloadGateValues {
  /** Learner name, trimmed, 1–100 characters (Req 6.2). */
  name: string;
  /** Learner email, trimmed, 1–254 characters in a valid format (Req 6.2). */
  email: string;
}

/**
 * The per-field validation messages surfaced next to the name/email inputs.
 * A field is omitted (undefined) when it is currently valid.
 */
export interface DownloadGateFieldErrors {
  /** Validation message for the name field, when invalid. */
  name?: string;
  /** Validation message for the email field, when invalid. */
  email?: string;
}

/**
 * Props for the DownloadGateModal.
 *
 * The modal is a controlled component: the parent decides when it is visible
 * (typically when no valid Access Token is present — Req 6.1 — or when the
 * existing token is expired/invalid — Req 6.7) and reacts to a successful
 * submission by proceeding with the blocked download.
 */
export interface DownloadGateModalProps {
  /** Whether the modal (and its blocking overlay) is rendered. */
  isOpen: boolean;
  /**
   * Called with the trimmed, validated name + email once the Learner submits a
   * valid Download Gate. The download must not proceed until this fires
   * (Req 6.1).
   */
  onSubmit: (values: DownloadGateValues) => void;
  /**
   * Called when the Learner dismisses the gate without submitting (Escape key,
   * overlay click, or the cancel action). The download stays blocked.
   */
  onCancel: () => void;
  /**
   * When true, the submit action shows a loading affordance and inputs are
   * disabled while the submission is in flight.
   */
  isSubmitting?: boolean;
  /**
   * An error message from a failed submission (e.g. a Backend API error). It is
   * shown without clearing the entered values so the current view is preserved
   * (Req 8.1).
   */
  submitError?: string;
  /** Optional additional class name applied to the dialog element. */
  className?: string;
}
