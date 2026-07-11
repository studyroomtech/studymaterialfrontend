// Constant values for the SetPasswordModal component (Requirements 5.3, 5.4).
//
// The modal prompts a signed-in Learner to secure their account by setting a
// password (first-time set) or to change an existing password (when
// `requireCurrentPassword` is true).

/** Stable ids used to associate the dialog with its title/description for AT. */
export const DIALOG_TITLE_ID = "set-password-title";
export const DIALOG_DESCRIPTION_ID = "set-password-description";

/** Field ids used to link each label and error message to its input. */
export const NEW_PASSWORD_FIELD_ID = "set-password-new";
export const CURRENT_PASSWORD_FIELD_ID = "set-password-current";

/** Heading and supporting copy shown at the top of the modal. */
export const DIALOG_TITLE = "Secure your account";
export const DIALOG_DESCRIPTION =
  "Set a password to protect your account. It must be 8 to 128 characters.";

/** Field labels. */
export const NEW_PASSWORD_LABEL = "New password";
export const CURRENT_PASSWORD_LABEL = "Current password";

/** Field placeholders. */
export const NEW_PASSWORD_PLACEHOLDER = "At least 8 characters";
export const CURRENT_PASSWORD_PLACEHOLDER = "Your current password";

/** Action labels. */
export const SUBMIT_LABEL = "Save password";
export const CANCEL_LABEL = "Cancel";
