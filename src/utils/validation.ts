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
  FILE_TOO_LARGE_ERROR_PREFIX,
  MAX_MATERIAL_FILES_PER_REQUEST,
  MAX_MATERIAL_FILE_SIZE_BYTES,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SEARCH_QUERY_MAX_LENGTH,
  MAX_THUMBNAIL_SIZE_BYTES,
  MAX_THUMBNAILS_PER_MATERIAL,
  THUMBNAIL_CONTENT_TYPES,
  THUMBNAIL_TOO_LARGE_ERROR_PREFIX,
  THUMBNAIL_TYPE_ERROR_PREFIX,
  TOO_MANY_FILES_ERROR,
  TOO_MANY_THUMBNAILS_ERROR,
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

export function validateMaterialFileSelection(
  files: File[],
): FieldValidationResult {
  if (files.length > MAX_MATERIAL_FILES_PER_REQUEST) {
    return { valid: false, reason: TOO_MANY_FILES_ERROR };
  }

  const oversizedNames = files
    .filter((file) => file.size > MAX_MATERIAL_FILE_SIZE_BYTES)
    .map((file) => file.name);

  if (oversizedNames.length > 0) {
    return {
      valid: false,
      reason: `${FILE_TOO_LARGE_ERROR_PREFIX} ${oversizedNames.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Client-side check of chosen thumbnail images against the Backend defaults:
 * JPG/PNG/WebP only, each within the size limit, and at most the per-material
 * count including the `existingCount` the material already has. The Backend
 * re-validates (by file content).
 */
export function validateThumbnailSelection(
  files: File[],
  existingCount = 0,
): FieldValidationResult {
  if (existingCount + files.length > MAX_THUMBNAILS_PER_MATERIAL) {
    return { valid: false, reason: TOO_MANY_THUMBNAILS_ERROR };
  }
  const wrongType = files.filter(
    (file) => !THUMBNAIL_CONTENT_TYPES.includes(file.type),
  );
  if (wrongType.length > 0) {
    return {
      valid: false,
      reason: `${THUMBNAIL_TYPE_ERROR_PREFIX} ${wrongType.map((file) => file.name).join(', ')}`,
    };
  }
  const oversized = files.filter((file) => file.size > MAX_THUMBNAIL_SIZE_BYTES);
  if (oversized.length > 0) {
    return {
      valid: false,
      reason: `${THUMBNAIL_TOO_LARGE_ERROR_PREFIX} ${oversized.map((file) => file.name).join(', ')}`,
    };
  }
  return { valid: true };
}
