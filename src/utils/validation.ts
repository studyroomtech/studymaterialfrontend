// Shared client-side validation helpers.
//
// These mirror the Backend Project's validation bounds so the Frontend Project
// can validate Download Gate and search input early and consistently before
// calling the Backend API (Req 6.2, 4.1). The Backend API remains the source of
// truth and re-validates every submission.

import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_PATTERN,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SEARCH_QUERY_MAX_LENGTH,
} from './validation.constant';
import type { FieldValidationResult } from './validation.types';

/** Return true when `value.length` is within the inclusive [min, max] range. */
export function isLengthWithin(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/** Return true when `email` is within the length bounds and matches the format. */
export function isValidEmail(email: string): boolean {
  return (
    isLengthWithin(email, EMAIL_MIN_LENGTH, EMAIL_MAX_LENGTH) &&
    EMAIL_PATTERN.test(email)
  );
}

/**
 * Validate a Download Gate name: 1–100 characters after trimming (Req 6.2).
 */
export function validateName(name: string): FieldValidationResult {
  const trimmed = name.trim();
  if (!isLengthWithin(trimmed, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
    return {
      valid: false,
      reason: `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`,
    };
  }
  return { valid: true };
}

/**
 * Validate a Download Gate email: 1–254 characters and a valid email format
 * (Req 6.2). Length is checked before format so the reason is specific.
 */
export function validateEmail(email: string): FieldValidationResult {
  const trimmed = email.trim();
  if (!isLengthWithin(trimmed, EMAIL_MIN_LENGTH, EMAIL_MAX_LENGTH)) {
    return {
      valid: false,
      reason: `Email must be between ${EMAIL_MIN_LENGTH} and ${EMAIL_MAX_LENGTH} characters.`,
    };
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { valid: false, reason: 'Email must be a valid email address.' };
  }
  return { valid: true };
}

/**
 * Validate an account password's length: 8–128 characters (Req 5.3). The value
 * is checked as-is (not trimmed) because surrounding whitespace is significant
 * in a password. Mirrors the Backend Project's bounds; the Backend API remains
 * the authority and re-validates every submission.
 */
export function validatePassword(value: string): FieldValidationResult {
  if (!isLengthWithin(value, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)) {
    return {
      valid: false,
      reason: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
    };
  }
  return { valid: true };
}

/**
 * Validate a search query's length. An empty or whitespace-only query is
 * treated as valid because it displays all materials (Req 4.3); a non-empty
 * query must not exceed the maximum length (Req 4.1).
 */
export function validateSearchQuery(query: string): FieldValidationResult {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return { valid: true };
  }
  if (trimmed.length > SEARCH_QUERY_MAX_LENGTH) {
    return {
      valid: false,
      reason: `Search query must be at most ${SEARCH_QUERY_MAX_LENGTH} characters.`,
    };
  }
  return { valid: true };
}
