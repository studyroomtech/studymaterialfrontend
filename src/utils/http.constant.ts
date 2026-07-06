// Constants for the shared HTTP fetch wrapper (`http.ts`).
//
// Centralizes the request timeout and the typed error-kind identifiers so the
// wrapper and the API-call hooks share a single source of truth.
//
// References:
//   - Req 8.2 / 7.4: a data request that does not complete within 30 seconds is
//     stopped and surfaced as a timeout error.
//   - Req 8.1:        request failures/error responses are surfaced so the UI
//     can render an error message while preserving user-entered data.

// Maximum time (in milliseconds) to wait for a Backend API response before the
// request is aborted and mapped to a timeout error (Req 8.2, 7.4).
export const REQUEST_TIMEOUT_MS = 30000;

// Discriminant values identifying the category of an HTTP failure so hooks can
// branch on the kind of error (timeout vs network vs API vs parse).
export const HTTP_ERROR_KIND = {
  timeout: 'timeout',
  network: 'network',
  api: 'api',
  parse: 'parse',
} as const;

// Default, user-facing messages for each error kind. The API error kind prefers
// the message returned in the Backend API error envelope when one is present.
export const DEFAULT_ERROR_MESSAGES = {
  timeout: 'The request timed out. Please try again.',
  network:
    'The request could not be completed. Please check your connection and try again.',
  api: 'The request could not be completed.',
  parse: 'The response from the server could not be read.',
} as const;
