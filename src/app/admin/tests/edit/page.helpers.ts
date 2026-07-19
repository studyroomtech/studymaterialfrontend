// Pure helpers for the Edit Page route (`/admin/tests/edit`).
//
// These functions are intentionally React-free so they can be unit- and
// property-tested independently of the page component. `TestManager` on the
// dashboard imports `buildEditHref` to build the navigation target for its Edit
// button, keeping the `testId` encoding centralized and round-trippable
// (Req 1.2, 1.4).

import { HTTP_ERROR_KIND } from '@/utils/http.constant';
import type { HttpError } from '@/utils/http.types';

import {
  AUTH_ERROR_COPY,
  EDIT_PAGE_PATH,
  GENERIC_LOAD_ERROR_MESSAGE,
  LOAD_ERROR_TITLE,
  MISSING_ID_COPY,
  NOT_AUTHORIZED_MESSAGE,
  NOT_FOUND_MESSAGE,
  STATUS_FORBIDDEN,
  STATUS_NOT_FOUND,
  TEST_ID_PARAM,
} from './page.constant';
import type { EditPageState, LoadState } from './page.types';

/**
 * Normalizes the raw `testId` search-param value to a trimmed identifier.
 *
 * Returns an empty string when the param is absent (`null`) or blank, which the
 * page treats as the "missing id" state (Req 1.2, 3.1).
 *
 * @param raw the raw search-param value from `useSearchParams().get(...)`.
 * @returns the trimmed Test id, or an empty string when null/blank.
 */
export function resolveTestId(raw: string | null): string {
  return (raw ?? '').trim();
}

/**
 * Builds the Edit Page navigation target for a given Test id.
 *
 * Encodes `testId` via `URLSearchParams` onto `EDIT_PAGE_PATH` so the value is
 * centrally encoded and survives the encode/navigate/decode round-trip even
 * when it contains URL-significant characters (Req 1.2, 1.4).
 *
 * @param testId the Test identifier to carry in the query string.
 * @returns a relative href of the form `/admin/tests/edit?testId=<encoded>`.
 */
export function buildEditHref(testId: string): string {
  const params = new URLSearchParams({ [TEST_ID_PARAM]: testId });
  return `${EDIT_PAGE_PATH}?${params.toString()}`;
}

/**
 * Maps a typed {@link HttpError} from the Load Operation to a non-empty,
 * user-facing message for the inline load-error state.
 *
 * An api error with status 404 NOT_FOUND maps to the not-found message
 * (Req 3.2), an api error with status 403 FORBIDDEN maps to the not-authorized
 * message (Req 3.3), and any other error maps to the server-provided
 * `error.message` when present, else the generic fallback (Req 3.4). The result
 * is always a non-empty string so every load failure produces readable copy.
 *
 * @param error the typed error returned by `getTestForAdmin`.
 * @returns a non-empty user-facing message describing the load failure.
 */
export function loadErrorMessage(error: HttpError): string {
  if (error.kind === HTTP_ERROR_KIND.api && error.status === STATUS_NOT_FOUND) {
    return NOT_FOUND_MESSAGE;
  }
  if (error.kind === HTTP_ERROR_KIND.api && error.status === STATUS_FORBIDDEN) {
    return NOT_AUTHORIZED_MESSAGE;
  }
  return error.message || GENERIC_LOAD_ERROR_MESSAGE;
}

/**
 * Resolves the {@link EditPageState} the Edit Page renders from its four
 * inputs, keeping all view-branching logic in one pure, React-free function so
 * it is unit- and property-testable.
 *
 * Precedence (evaluated top to bottom, per the design):
 *   1. pre-mount (`!hasMounted`) → `loading` — avoids the SSR/hydration
 *      mismatch since `isAdmin` is always false during SSR/first client render
 *      (Req 2.2);
 *   2. non-admin (`!isAdmin`) → `auth-error`, withholding the editor for any
 *      `testId`/`load` combination (Req 4.1, 4.2);
 *   3. empty `testId` → `missing-id`; the page's load effect is likewise
 *      guarded so `getTestForAdmin` never runs for a blank id (Req 3.1);
 *   4. load `pending` → `loading` (Req 2.2);
 *   5. load `error` → `load-error` carrying the mapped message (Req 3.2–3.5);
 *   6. load `success` → `editor` carrying the loaded Admin_Test (Req 2.3).
 *
 * The resolver never emits a redirect directive; every non-loading, non-editor
 * variant carries non-empty title/message copy intended to be shown alongside
 * the dashboard link (Req 3.5, 5.3).
 *
 * @param input the current page inputs: post-mount flag, admin status,
 *   normalized `testId`, and the Load Operation state.
 * @returns the discriminated page view state to render.
 */
export function resolvePageState(input: {
  hasMounted: boolean;
  isAdmin: boolean;
  testId: string;
  load: LoadState;
}): EditPageState {
  if (!input.hasMounted) {
    return { kind: 'loading' };
  }
  if (!input.isAdmin) {
    return { kind: 'auth-error', ...AUTH_ERROR_COPY };
  }
  if (input.testId.length === 0) {
    return { kind: 'missing-id', ...MISSING_ID_COPY };
  }
  if (input.load.status === 'pending') {
    return { kind: 'loading' };
  }
  if (input.load.status === 'error') {
    return {
      kind: 'load-error',
      title: LOAD_ERROR_TITLE,
      message: loadErrorMessage(input.load.error),
    };
  }
  return { kind: 'editor', test: input.load.test };
}
