// Constant values for the DownloadGateModal component (Requirements 1.16, 6.1).
//
// The Download Gate prompts a Learner for a name and email before a download
// proceeds when no valid Access Token is present (Req 6.1) or the existing
// token is expired/invalid (Req 6.7).

/** Stable ids used to associate the dialog with its title/description for AT. */
export const DIALOG_TITLE_ID = "download-gate-title";
export const DIALOG_DESCRIPTION_ID = "download-gate-description";

/** Field ids used to link each label, hint, and error message to its input. */
export const NAME_FIELD_ID = "download-gate-name";
export const EMAIL_FIELD_ID = "download-gate-email";

/** Heading and supporting copy shown at the top of the gate. */
export const DIALOG_TITLE = "Almost there";
export const DIALOG_DESCRIPTION =
  "Enter your name and email to download this material. We only ask once.";

/** Field labels. */
export const NAME_LABEL = "Name";
export const EMAIL_LABEL = "Email";

/** Field placeholders. */
export const NAME_PLACEHOLDER = "Ada Lovelace";
export const EMAIL_PLACEHOLDER = "ada@example.com";

/** Action labels. */
export const SUBMIT_LABEL = "Continue download";
export const CANCEL_LABEL = "Cancel";
