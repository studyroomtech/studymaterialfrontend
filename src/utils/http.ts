// Shared HTTP fetch wrapper for calling the Backend API.
//
// Responsibilities:
//   - Enforce a 30-second timeout via an `AbortController`; exceeding it maps to
//     a typed `timeout` error the hooks can surface (Req 8.2, 7.4).
//   - Never throw for expected failures: network errors, timeouts, and non-2xx
//     API responses are mapped to a typed `HttpResult` error so callers can
//     render an error message while preserving user-entered data (Req 8.1).
//   - Parse the Backend API's unified error envelope when present, exposing the
//     error `code`, `message`, and per-field reasons.

import {
  DEFAULT_ERROR_MESSAGES,
  HTTP_ERROR_KIND,
  REQUEST_TIMEOUT_MS,
} from './http.constant';
import { emitToast } from './toastBus';
import type {
  ApiErrorEnvelope,
  FieldError,
  HttpErrorKind,
  HttpRequestOptions,
  HttpResult,
} from './http.types';

/**
 * Perform an HTTP request against the Backend API, returning a typed result.
 *
 * The request is aborted after `timeoutMs` (default 30s); a timeout is reported
 * as an `HttpResult` error with kind `timeout` rather than throwing. Any caller
 * supplied `AbortSignal` is honored in addition to the internal timeout.
 */
export async function httpRequest<T>(
  input: string,
  options: HttpRequestOptions = {},
): Promise<HttpResult<T>> {
  const {
    timeoutMs = REQUEST_TIMEOUT_MS,
    signal: externalSignal,
    suppressErrorToast = false,
    ...init
  } = options;

  const controller = new AbortController();
  let timedOut = false;

  const onExternalAbort = (): void => {
    controller.abort();
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let result: HttpResult<T>;
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    result = await buildResult<T>(response);
  } catch {
    // A timeout aborts the internal controller and flips `timedOut`; any other
    // rejection (DNS failure, connection reset, offline, external abort) is a
    // network-level failure.
    result = timedOut
      ? failure(HTTP_ERROR_KIND.timeout, DEFAULT_ERROR_MESSAGES.timeout)
      : failure(HTTP_ERROR_KIND.network, DEFAULT_ERROR_MESSAGES.network);
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }

  // Surface any failure as a global error toast unless the caller opts out
  // because it renders its own inline error (Req 8.1 — "whenever an API fails").
  if (!result.ok && !suppressErrorToast) {
    emitToast({ message: result.error.message, variant: 'error' });
  }

  return result;
}

/**
 * Build a typed result from a completed `Response`, parsing the JSON body and,
 * for non-2xx responses, the Backend API error envelope.
 */
async function buildResult<T>(response: Response): Promise<HttpResult<T>> {
  const rawBody = await response.text();
  const parsedBody = parseJson(rawBody);

  if (!response.ok) {
    const envelope = extractErrorEnvelope(parsedBody);
    return {
      ok: false,
      error: {
        kind: HTTP_ERROR_KIND.api,
        message: envelope?.message ?? DEFAULT_ERROR_MESSAGES.api,
        status: response.status,
        code: envelope?.code,
        fields: envelope?.fields,
      },
    };
  }

  return { ok: true, status: response.status, data: parsedBody as T };
}

/** Build a failed `HttpResult` for a transport-level error (no HTTP status). */
function failure(kind: HttpErrorKind, message: string): HttpResult<never> {
  return { ok: false, error: { kind, message } };
}

/** Safely parse a JSON body; returns `undefined` for empty or invalid JSON. */
function parseJson(rawBody: string): unknown {
  if (rawBody.length === 0) {
    return undefined;
  }
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Narrow an unknown parsed body to the Backend API error envelope's `error`
 * object, returning `undefined` when the shape does not match.
 */
function extractErrorEnvelope(
  body: unknown,
): { code: string; message: string; fields?: FieldError[] } | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  const { error } = body as Partial<ApiErrorEnvelope>;
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const { code, message, fields } = error;
  if (typeof code !== 'string' || typeof message !== 'string') {
    return undefined;
  }

  return {
    code,
    message,
    fields: Array.isArray(fields) ? fields : undefined,
  };
}
