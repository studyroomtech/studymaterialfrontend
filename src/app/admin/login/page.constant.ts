// Constants for the deprecated admin login route (Req 1.16, 1.17).
//
// The separate admin login has been removed — admin access comes from signing
// in on the account page with a `role_admin` user. This route redirects there.

/** The account page the deprecated admin login redirects to. */
export const ACCOUNT_PATH = '/account';
