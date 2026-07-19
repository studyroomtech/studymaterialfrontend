// Pure date/time formatting utility.
//
// The Backend serializes timestamps as ISO 8601 UTC `Z` strings (Req 16.3).
// This framework-free helper renders such a string as a human-readable local
// date + time for display (e.g. attempt completion times on the history and
// review surfaces). It never throws: an absent or unparseable value yields a
// stable fallback label so callers can render it directly.

import {
  DATE_TIME_FORMAT_OPTIONS,
  DATE_TIME_LOCALE,
  INVALID_DATE_TIME_LABEL,
} from './date.constant';

/**
 * Format an ISO 8601 timestamp as a human-readable date + time.
 * @param isoTimestamp an ISO 8601 UTC `Z` string (e.g. `2026-07-12T14:05:00Z`).
 * @returns the formatted local date + time, or a fallback label when the value
 *   is missing or cannot be parsed.
 */
export function formatDateTime(isoTimestamp: string | null | undefined): string {
  if (typeof isoTimestamp !== 'string' || isoTimestamp.length === 0) {
    return INVALID_DATE_TIME_LABEL;
  }

  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return INVALID_DATE_TIME_LABEL;
  }

  return new Intl.DateTimeFormat(
    DATE_TIME_LOCALE,
    DATE_TIME_FORMAT_OPTIONS,
  ).format(parsed);
}
