// Constants for the Edit Page route (`/admin/tests/edit`).
//
// Centralizes the route paths, the `testId` search-param name, the HTTP status
// discriminants used by the load-error mapping, and all user-facing title /
// message copy for each inline error state. Keeping the copy here (rather than
// inline in the component) makes the pure helpers unit-testable and gives the
// UI a single source of truth (Req 1.1, 1.2, 3.1–3.4, 4.2).

// The App Router path the Edit Page is served at (Req 1.1).
export const EDIT_PAGE_PATH = '/admin/tests/edit';

// The Admin Dashboard path the inline error links and Back control navigate to
// (Req 3.1–3.5, 5.2, 5.3).
export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';

// The query-string search-param name carrying the target Test identifier in the
// Edit Page URL (Req 1.2).
export const TEST_ID_PARAM = 'testId';

// HTTP status discriminants used by the load-error message mapping (Req 3.2, 3.3).
export const STATUS_NOT_FOUND = 404;
export const STATUS_FORBIDDEN = 403;

// Inline error copy shown when a non-admin user loads the Edit Page (Req 4.2).
export const AUTH_ERROR_COPY = {
  title: 'Access not authorized',
  message: 'You need administrator access to edit tests.',
} as const;

// Inline error copy shown when the Edit Page mounts without a `testId` param
// (Req 3.1).
export const MISSING_ID_COPY = {
  title: 'No test selected',
  message: 'No test was specified to edit. Return to the dashboard to pick a test.',
} as const;

// Title shown above any load-failure message (Req 3.2–3.4).
export const LOAD_ERROR_TITLE = 'Unable to load test';

// Message shown when the Load Operation returns a 404 NOT_FOUND (Req 3.2).
export const NOT_FOUND_MESSAGE = 'The requested test could not be found.';

// Message shown when the Load Operation returns a 403 FORBIDDEN (Req 3.3).
export const NOT_AUTHORIZED_MESSAGE = 'You are not authorized to edit this test.';

// Fallback message shown for any other load failure that carries no
// server-provided message (Req 3.4).
export const GENERIC_LOAD_ERROR_MESSAGE = 'Something went wrong while loading the test. Please try again.';

// Label for the free-Test indicator shown in the editor's metadata header
// (mirrors the dashboard list indicator, Req 2.3).
export const FREE_BADGE_LABEL = 'Free';

// Label for the Back control that returns the Admin_User to the dashboard
// (Req 5.2).
export const BACK_TO_LIST_LABEL = 'Back to tests';
