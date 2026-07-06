// Constants for the API-call hooks in the Hooks Folder (`hooks/api/`).
//
// Centralizes the Backend API route paths and per-request timeout overrides so
// every API-call hook shares a single source of truth. The Backend API base
// URL itself is read at call time from `NEXT_PUBLIC_API_BASE_URL` (see
// `apiClient.ts`) rather than hardcoded here.

// Backend API route paths (relative to the configured API base URL).
//   - `catalog`         -> GET  /api/catalog                       (Req 3.1)
//   - `materialsSearch` -> GET  /api/materials/search              (Req 4.1)
//   - `material`        -> GET  /api/materials/:id                 (Req 5.1)
//   - `downloadsGate`   -> POST /api/downloads/gate                (Req 6.2)
//   - `material` + id + `/download` -> POST /api/materials/:id/download (Req 6.8)
export const API_ROUTES = {
  catalog: '/api/catalog',
  materialsSearch: '/api/materials/search',
  material: '/api/materials',
  downloadsGate: '/api/downloads/gate',
  // `materialsPaid` -> GET  /api/materials/paid          (Req 12.1)
  materialsPaid: '/api/materials/paid',
  // `paymentsVerify` -> POST /api/payments/verify        (Req 12.6, 12.7)
  paymentsVerify: '/api/payments/verify',
  // `accountLogin` -> POST /api/account/login            (email-only sign-in)
  accountLogin: '/api/account/login',
} as const;

// Sub-path appended to a material route to reach its download endpoint, e.g.
// `/api/materials/:id/download` (Req 6.8).
export const MATERIAL_DOWNLOAD_ACTION = 'download';

// Sub-path appended to a material route to reach its inline preview endpoint,
// e.g. `/api/materials/:id/preview`.
export const MATERIAL_PREVIEW_ACTION = 'preview';

// Sub-path appended to a material route to reach its payment-initiation
// endpoint, e.g. `/api/materials/:id/payment` (Req 12.4).
export const MATERIAL_PAYMENT_ACTION = 'payment';

// Query-parameter names used by the search endpoint (Req 4.1, 4.2).
export const SEARCH_QUERY_PARAMS = {
  query: 'q',
  categoryId: 'categoryId',
} as const;

// Per-request timeout (ms) for a single Study Material view. Req 5.5 requires an
// error to be shown when the material does not load within 5 seconds; this is
// tighter than the shared 30s default enforced by `utils/http.ts` (Req 8.2).
export const MATERIAL_REQUEST_TIMEOUT_MS = 5000;
