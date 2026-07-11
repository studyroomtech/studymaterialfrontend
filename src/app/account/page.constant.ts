// Constant values for the account settings page (Req 1.16, 1.17, 6.3–6.7).
//
// The account page lets a Learner sign in with just an email and sign out.
// These literals are defined here so the page module stays free of
// constant-literal exports (Req 1.16, 1.17).

/** Base URL the learner is sent to after a successful sign-in. */
export const HOME_PATH = '/';

/** Page heading and supporting copy. */
export const ACCOUNT_TITLE = 'Account settings';
export const ACCOUNT_SUBTITLE =
  'Sign in with your email to keep your downloads and purchases across visits.';

/** Signed-in view copy. */
export const SIGNED_IN_HEADING = 'Signed in';
export const SIGNED_IN_AS_LABEL = 'Signed in as';
export const NAME_IDENTITY_LABEL = 'Name';
export const EMAIL_IDENTITY_LABEL = 'Email';
export const LOGOUT_LABEL = 'Sign out';

/** Signed-out (sign-in form) view copy. */
export const SIGN_IN_HEADING = 'Sign in';
export const NAME_FIELD_ID = 'account-name';
export const NAME_LABEL = 'Name';
export const NAME_PLACEHOLDER = 'Ada Lovelace';
export const EMAIL_FIELD_ID = 'account-email';
export const EMAIL_LABEL = 'Email';
export const EMAIL_PLACEHOLDER = 'ada@example.com';

/**
 * Optional password field on the sign-in form (Req 5, Req 4 support).
 * The field is not required client-side: an empty value posts as email-only.
 * The rendered Input uses `type="password"` and `autoComplete="current-password"`.
 */
export const PASSWORD_FIELD_ID = 'account-password';
export const PASSWORD_LABEL = 'Password';
export const PASSWORD_PLACEHOLDER = 'Optional';
export const PASSWORD_AUTOCOMPLETE = 'current-password';

export const SIGN_IN_SUBMIT_LABEL = 'Sign in';

/** Client-side validation copy mirroring the Backend name/email bounds (Req 6.2, 6.3). */
export const NAME_REQUIRED_ERROR = 'Enter your name (1–100 characters).';
export const EMAIL_REQUIRED_ERROR = 'Enter a valid email address.';

/** Error banner copy shown when the Backend API rejects the sign-in (Req 8.1). */
export const SIGN_IN_ERROR_TITLE = 'Sign in failed';
export const SIGN_IN_FALLBACK_ERROR =
  'We could not sign you in. Check your email and try again.';
