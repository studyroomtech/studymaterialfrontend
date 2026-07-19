// Constant values for the date/time formatting utility.
//
// Centralizing the locale and format options keeps the `date.ts` module free of
// constant-literal exports (matching the `*.constant.ts` / `*.ts` convention
// used across `utils/`).

/**
 * BCP 47 locale used to render timestamps. `undefined` defers to the runtime's
 * default locale so displayed times match the visitor's environment.
 */
export const DATE_TIME_LOCALE: string | undefined = undefined;

/**
 * `Intl.DateTimeFormat` options for a human-readable date + time, used for
 * attempt completion times (e.g. "12 Jul 2026, 14:05").
 */
export const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/** Fallback rendered when a timestamp is missing or cannot be parsed. */
export const INVALID_DATE_TIME_LABEL = '—';
