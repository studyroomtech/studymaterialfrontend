// Types for the shared HTTP fetch wrapper (`http.ts`).
//
// The wrapper returns a discriminated `HttpResult<T>` so API-call hooks can
// surface success data or a typed error (timeout, network, API, or parse)
// without throwing (Req 8.1, 8.2, 7.4).

import type { HTTP_ERROR_KIND } from './http.constant';

// The category of an HTTP failure, derived from the constant discriminants.
export type HttpErrorKind = (typeof HTTP_ERROR_KIND)[keyof typeof HTTP_ERROR_KIND];

// A single invalid field reported by the Backend API validation envelope.
export interface FieldError {
  field: string;
  reason: string;
}

// The unified error envelope returned by the Backend API on failures.
// See the design's "Unified Error Envelope": `{ error: { code, message, fields } }`.
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    fields?: FieldError[];
  };
}

// A typed error the hooks can surface to the UI.
export interface HttpError {
  // The category of failure (timeout, network, api, parse).
  kind: HttpErrorKind;
  // A user-facing message (from the API envelope when available).
  message: string;
  // The HTTP status code, present for `api` errors.
  status?: number;
  // The Backend API error code (e.g. VALIDATION_ERROR), present for `api` errors.
  code?: string;
  // Per-field validation reasons, present for validation errors.
  fields?: FieldError[];
}

// Options accepted by the fetch wrapper. Extends the standard `RequestInit`
// with an optional per-request timeout override.
export interface HttpRequestOptions extends RequestInit {
  // Overrides the default 30-second timeout (in milliseconds).
  timeoutMs?: number;
}

// The result of an HTTP request: either success with parsed data, or a typed
// error. Modeled as a discriminated union so callers must handle both cases.
export type HttpResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; error: HttpError };
