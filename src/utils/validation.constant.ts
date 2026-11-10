// Constants for shared client-side validation (`validation.ts`).
//
// These character-length bounds mirror the Backend Project's validation bounds
// (see backend `constants/limits.constant.ts`) so the Frontend Project can give
// early, consistent feedback before submitting to the Backend API. The Backend
// API remains the authority and re-validates every submission.
//
// References:
//   - Req 6.2: Download Gate name (1–100) and email (1–254, valid format).
//   - Req 4.1: Search query (1–100 characters).

// --- Learner (Download Gate) ---
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 100;

export const EMAIL_MIN_LENGTH = 1;
export const EMAIL_MAX_LENGTH = 254;

// --- Account password ---
// Password length bounds enforced client-side when a Learner sets a password,
// mirroring the Backend Project's bounds (see backend `limits.constant.ts`).
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// --- Search ---
export const SEARCH_QUERY_MIN_LENGTH = 1;
export const SEARCH_QUERY_MAX_LENGTH = 100;

export const MAX_MATERIAL_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_MATERIAL_FILES_PER_REQUEST = 10;

const BYTES_PER_MEGABYTE = 1024 * 1024;

const MAX_MATERIAL_FILE_SIZE_MEGABYTES =
  MAX_MATERIAL_FILE_SIZE_BYTES / BYTES_PER_MEGABYTE;

export const TOO_MANY_FILES_ERROR = `Select at most ${MAX_MATERIAL_FILES_PER_REQUEST} files at a time.`;

export const FILE_TOO_LARGE_ERROR_PREFIX = `Each file must be ${MAX_MATERIAL_FILE_SIZE_MEGABYTES} MB or smaller. Too large:`;

// --- Thumbnails (mirror the Backend defaults) ---
export const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_THUMBNAILS_PER_MATERIAL = 6;
/** Accepted thumbnail MIME types; also the file input's `accept` value. */
export const THUMBNAIL_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const THUMBNAIL_ACCEPT = THUMBNAIL_CONTENT_TYPES.join(',');
export const TOO_MANY_THUMBNAILS_ERROR = `A material can have at most ${MAX_THUMBNAILS_PER_MATERIAL} thumbnails.`;
export const THUMBNAIL_TOO_LARGE_ERROR_PREFIX = `Each thumbnail must be ${MAX_THUMBNAIL_SIZE_BYTES / BYTES_PER_MEGABYTE} MB or smaller. Too large:`;
export const THUMBNAIL_TYPE_ERROR_PREFIX = 'Thumbnails must be JPG, PNG, or WebP images. Not allowed:';

// Pragmatic email-format check: a non-empty local part, a single "@", and a
// domain containing at least one dot, with no whitespace. Mirrors the intent of
// the Backend API's email-format validation for early client-side feedback.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Grouped view of the length bounds for convenient, type-safe access.
export const LENGTH_BOUNDS = {
  name: { min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH },
  email: { min: EMAIL_MIN_LENGTH, max: EMAIL_MAX_LENGTH },
  searchQuery: { min: SEARCH_QUERY_MIN_LENGTH, max: SEARCH_QUERY_MAX_LENGTH },
} as const;
