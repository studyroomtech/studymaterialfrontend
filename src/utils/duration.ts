// Pure duration formatting utility.
//
// The Backend reports Accumulated Active Time as whole seconds (R1). This
// framework-free helper renders such a count as a compact human-readable
// duration (e.g. `1h 04m`, `12m 30s`, `45s`) for the result and performance
// surfaces. It never throws: a null/negative/unparseable value yields a stable
// fallback label, so callers can render the result directly.
//
// Per-Section time is genuinely absent under Overall Timing, where the whole
// Test shares one clock — hence `null` maps to a placeholder rather than zero,
// which would wrongly claim the Learner spent no time in that Section.

import {
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  UNKNOWN_DURATION_LABEL,
  ZERO_DURATION_LABEL,
} from './duration.constant';

/** Left-pad a number to two digits, so `1h 4m` reads as `1h 04m`. */
function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Format a whole-second duration for display.
 * @param totalSeconds the duration in whole seconds, or `null` when none exists.
 * @returns a compact duration (`1h 04m`, `12m 30s`, `45s`), or a fallback label
 *   when the value is missing or not a usable number.
 */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0
  ) {
    return UNKNOWN_DURATION_LABEL;
  }

  const seconds = Math.floor(totalSeconds);
  if (seconds === 0) {
    return ZERO_DURATION_LABEL;
  }

  if (seconds >= SECONDS_PER_HOUR) {
    const hours = Math.floor(seconds / SECONDS_PER_HOUR);
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    return `${hours}h ${pad(minutes)}m`;
  }

  if (seconds >= SECONDS_PER_MINUTE) {
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
    return `${minutes}m ${pad(seconds % SECONDS_PER_MINUTE)}s`;
  }

  return `${seconds}s`;
}
