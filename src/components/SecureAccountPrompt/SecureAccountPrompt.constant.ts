// Constant values for the SecureAccountPrompt component (Requirements 5.1, 5.3).
//
// SecureAccountPrompt tells a signed-in Learner whose account is Unprotected
// that they can secure it with a password (Req 5.1) and offers a set-password
// action they can activate (Req 5.3). The copy lives here so the exact message
// is defined once and never hard-coded in the component logic.

/** Exact prompt copy shown to a Learner with an Unprotected Account (Req 5.1). */
export const SECURE_ACCOUNT_MESSAGE = "Secure your account with a password";

/** Label for the set-password action button (Req 5.3). */
export const SET_PASSWORD_ACTION_LABEL = "Set a password";
