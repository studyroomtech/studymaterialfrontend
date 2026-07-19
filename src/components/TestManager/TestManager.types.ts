// Type declarations for the TestManager authoring surface
// (`TestManager.tsx`). All type/interface declarations live here so the
// component module stays free of type declarations, mirroring the platform
// convention (e.g. `page.types.ts`). References: Req 2.1, 2.5, 5.3.

import type { TestTimingMode } from '@/types/testSeries.types';

/**
 * The controlled create-Test form draft. `timeLimitSeconds` and `price` are
 * held as raw strings (as typed) and parsed on submit; `price` is an amount in
 * paise where blank/0 denotes a free Test (Req 2.4).
 */
export interface CreateTestDraft {
  title: string;
  timingMode: TestTimingMode;
  timeLimitSeconds: string;
  price: string;
}

/**
 * Per-field inline validation errors for the create-Test form, surfaced beneath
 * each field (Req 2.5). Keys match the create-Test form fields; a 422 envelope's
 * per-field reasons (`HttpError.fields`) are mapped onto these keys.
 */
export interface CreateTestFieldErrors {
  title?: string;
  timingMode?: string;
  timeLimitSeconds?: string;
  price?: string;
}

/** A success/error banner shown after an authoring action (Req 2.1, 2.5). */
export interface TestManagerFeedback {
  kind: 'success' | 'error';
  message: string;
}

/**
 * The result of parsing the raw price-field input into a Price amount in paise.
 * An empty/whitespace value or 0 maps to a free Test (`amount: null`); a
 * positive whole number maps to a priced Test; any other value is rejected.
 */
export type ParsedPrice = { ok: true; amount: number | null } | { ok: false };
