// Constants for the learner Access Token hook (Req 6.6, 6.7).

/**
 * Browser `localStorage` key under which the learner's JWT Access Token is
 * persisted so that subsequent downloads reuse the stored identity without
 * re-prompting via the Download Gate (Req 6.6).
 */
export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

/**
 * The elevated Role identifier. When a signed-in learner's token `roles` claim
 * includes this value, the Frontend Project treats them as an admin and the
 * Backend elevates the request to `role_admin` (Req 10.1, 10.4).
 */
export const ROLE_ADMIN = 'role_admin';

/**
 * Cookie name under which the learner Access Token is mirrored (alongside
 * `localStorage`) so it is also available as a cookie (e.g. for server-side
 * reads). Shares the storage key for a single source of truth.
 */
export const ACCESS_TOKEN_COOKIE_NAME = ACCESS_TOKEN_STORAGE_KEY;

/**
 * Max-Age (seconds) applied to the Access Token cookie, matching the token's
 * 30-day lifetime (Req 6.5).
 */
export const ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS = 2592000;

/**
 * Name of the custom DOM event dispatched whenever the Access Token changes
 * within the current tab. The browser `storage` event only fires in *other*
 * tabs, so this same-tab event lets every `useAccessToken` instance (e.g. the
 * account page and the navigation) re-sync immediately after a sign-in or
 * sign-out without a page refresh.
 */
export const ACCESS_TOKEN_CHANGED_EVENT = 'access-token-changed';
