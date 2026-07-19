// View-state types for the Edit Page route (`/admin/tests/edit`).
//
// These client-only discriminated unions model (1) the outcome of the
// `getTestForAdmin` Load Operation (`LoadState`) and (2) the resolved page view
// the component renders (`EditPageState`). Keeping them separate lets the pure
// `resolvePageState` helper map load inputs to a render outcome independent of
// React, so the branching logic is unit- and property-testable (Req 2.2, 2.3,
// 3.1–3.4, 4.2). Type declarations only — no logic.

import type { AdminTestDto } from '@/types/testSeries.types';
import type { HttpError } from '@/utils/http.types';

/**
 * The outcome of the `getTestForAdmin(testId)` Load Operation:
 *   - `pending` while the request is in flight (or before it starts),
 *   - `success` carrying the loaded Admin_Test,
 *   - `error` carrying the typed `HttpError` on failure.
 */
export type LoadState =
  | { status: 'pending' }
  | { status: 'success'; test: AdminTestDto }
  | { status: 'error'; error: HttpError };

/**
 * The resolved page view state the Edit Page renders. Every non-editor variant
 * is an inline surface (rendered alongside a dashboard link) — the resolver
 * never emits a redirect directive (Req 3.5, 5.3):
 *   - `loading`     — pre-mount or a Load Operation in flight (Req 2.2),
 *   - `editor`      — the Load Operation succeeded; render the authoring editor
 *                     seeded with `test` (Req 2.3),
 *   - `auth-error`  — the user is not an admin (Req 4.2),
 *   - `missing-id`  — the `testId` param is absent/blank (Req 3.1),
 *   - `load-error`  — the Load Operation returned an `HttpError` (Req 3.2–3.4).
 */
export type EditPageState =
  | { kind: 'loading' }
  | { kind: 'editor'; test: AdminTestDto }
  | { kind: 'auth-error'; title: string; message: string }
  | { kind: 'missing-id'; title: string; message: string }
  | { kind: 'load-error'; title: string; message: string };
