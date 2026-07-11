'use client';

// `useSetPassword` — authenticated "secure your account" flow that stores a
// password on the signed-in Learner's User Record via `POST /api/account/password`
// (Req 5.3, 5.4).
//
// Reads the learner's raw Access Token from `useAccessToken().token` and sends
// it as a `Authorization: Bearer <token>` header alongside a JSON body of
// `{ newPassword, currentPassword? }` (the current password is only included
// when re-setting the password on an already-protected account). The call is
// made through the shared `httpRequest` wrapper so failures surface as a typed
// `HttpError` rather than throwing.
//
// Outcomes are mapped for the consuming `SetPasswordModal` (Req 5.4):
//   - `200`        -> `{ ok: true }`
//   - `422`        -> `{ ok: false, fieldErrors }`, derived from the backend's
//                     `HttpError.fields` array (`{ field, reason }`), keyed by
//                     `newPassword` / `currentPassword`.
//   - `401`/other  -> `{ ok: false, submitError }`, from `HttpError.message`.
// When no token is present there is nothing to authenticate, so the request is
// skipped and a submit error is returned. `isSubmitting` tracks the in-flight
// state for the modal's loading indicator.

import { useCallback, useState } from 'react';

import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import type {
  SetPasswordFieldErrors,
  SetPasswordOutcome,
  SetPasswordValues,
  UseSetPasswordResult,
} from './useSetPassword.types';
import { useAccessToken } from '../useAccessToken';

/** JSON request headers shared by the set-password call. */
const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/** HTTP status returned when the submitted values fail validation (Req 5.4). */
const HTTP_STATUS_VALIDATION = 422;

/** Message surfaced when there is no signed-in identity to authenticate. */
const MISSING_TOKEN_MESSAGE = 'You must be signed in to set a password.';

/** Fallback message when a failure carries no user-facing text. */
const DEFAULT_SUBMIT_ERROR = 'Something went wrong. Please try again.';

/** The per-field keys the modal can render inline errors against (Req 5.4). */
const FIELD_ERROR_KEYS: readonly (keyof SetPasswordFieldErrors)[] = [
  'newPassword',
  'currentPassword',
];

/**
 * Map the backend's 422 `fields` array (`{ field, reason }`) onto the modal's
 * per-field error shape, keeping only the recognized `newPassword` /
 * `currentPassword` keys (Req 5.4). Returns `undefined` when nothing maps.
 */
const toFieldErrors = (
  error: HttpError,
): SetPasswordFieldErrors | undefined => {
  if (!error.fields || error.fields.length === 0) {
    return undefined;
  }
  const fieldErrors: SetPasswordFieldErrors = {};
  for (const { field, reason } of error.fields) {
    if ((FIELD_ERROR_KEYS as readonly string[]).includes(field)) {
      fieldErrors[field as keyof SetPasswordFieldErrors] = reason;
    }
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

export const useSetPassword = (): UseSetPasswordResult => {
  const { token } = useAccessToken();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setPassword = useCallback(
    async ({
      newPassword,
      currentPassword,
    }: SetPasswordValues): Promise<SetPasswordOutcome> => {
      // Without a token there is no identity to authenticate; skip the request
      // rather than send an unauthenticated call (Req 5.3).
      if (token === null || token.length === 0) {
        return { ok: false, submitError: MISSING_TOKEN_MESSAGE };
      }

      setIsSubmitting(true);

      // Include `currentPassword` only when a non-empty one is supplied, i.e.
      // when re-setting the password on an already-protected account (Req 5.4).
      const body: { newPassword: string; currentPassword?: string } = {
        newPassword,
      };
      if (
        typeof currentPassword === 'string' &&
        currentPassword.length > 0
      ) {
        body.currentPassword = currentPassword;
      }

      const result = await httpRequest<unknown>(
        buildApiUrl(API_ROUTES.accountPassword),
        {
          method: 'POST',
          headers: {
            ...JSON_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
          // The modal renders field/submit errors inline; suppress the global
          // toast to avoid a duplicate message.
          suppressErrorToast: true,
        },
      );

      setIsSubmitting(false);

      if (result.ok) {
        return { ok: true };
      }

      // A 422 carries per-field validation reasons for inline display (Req 5.4).
      if (result.error.status === HTTP_STATUS_VALIDATION) {
        const fieldErrors = toFieldErrors(result.error);
        if (fieldErrors) {
          return { ok: false, fieldErrors };
        }
      }

      // A mid-session 401 or any other failure surfaces as a submit error.
      return {
        ok: false,
        submitError: result.error.message || DEFAULT_SUBMIT_ERROR,
      };
    },
    [token],
  );

  return { isSubmitting, setPassword };
};
