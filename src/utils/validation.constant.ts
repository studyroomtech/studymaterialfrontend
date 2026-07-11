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
