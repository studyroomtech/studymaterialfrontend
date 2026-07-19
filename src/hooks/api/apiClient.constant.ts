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
  // `paymentsInitiate` -> POST /api/payments/initiate    (cart checkout)
  paymentsInitiate: '/api/payments/initiate',
  // `accountLogin` -> POST /api/account/login            (email-only sign-in)
  accountLogin: '/api/account/login',
  // `accountPassword` -> /api/account/password           (optional account password)
  accountPassword: '/api/account/password',
  // `accountMe` -> GET /api/account/me                   (authoritative profile + protection status)
  accountMe: '/api/account/me',

  // --- Test Series (admin authoring) --------------------------------------
  // Base paths for the admin Test-authoring endpoints. Path params (`:id`) and
  // nested collections are appended at call time via template literals, e.g.
  // `${adminTests}/${id}`, `${adminTests}/${id}/${TEST_SECTIONS_SEGMENT}`
  // (matching how `ADMIN_API_ROUTES.materials` is composed).
  //   - `adminTests`     -> POST /api/admin/tests                     (Req 2.1)
  //                         PATCH /api/admin/tests/:id                (Req 5.5)
  //                         GET  /api/admin/tests/:id                 (Req 5.3)
  //                         POST /api/admin/tests/:id/sections        (Req 5.1)
  //   - `adminSections`  -> PATCH /api/admin/sections/:id             (Req 5.2)
  //                         POST /api/admin/sections/:id/questions    (Req 4.1)
  //   - `adminQuestions` -> PATCH /api/admin/questions/:id            (Req 5.2)
  adminTests: '/api/admin/tests',
  adminSections: '/api/admin/sections',
  adminQuestions: '/api/admin/questions',

  // --- Test Series (learner) ----------------------------------------------
  // `tests` -> GET /api/tests                             (Test Series + Sectional listings, Req 6.2)
  //            POST /api/tests/:id/attempts               (start/resume Test attempt, Req 9.1)
  //            POST /api/tests/:id/retake                 (retake, Req 15)
  tests: '/api/tests',
  // `sections` -> POST /api/sections/:id/attempts         (start/resume Section attempt, Req 8.2)
  sections: '/api/sections',
  // `attempts` -> GET /api/attempts                       (history, Req 14.1)
  //               GET /api/attempts/:id                   (review, Req 14.2)
  //               POST /api/attempts/:id/pause            (Req 10.1)
  //               POST /api/attempts/:id/resume           (Req 10.3)
  //               POST /api/attempts/:id/responses        (Req 9.4)
  //               POST /api/attempts/:id/submit           (finalize + score, Req 11.4)
  attempts: '/api/attempts',

  // `paymentsInitiateProducts` -> POST /api/payments/initiate-products  (product cart order, Req 7.1)
  paymentsInitiateProducts: '/api/payments/initiate-products',
} as const;

// Sub-path appended to an admin Test route to reach its Sections collection,
// e.g. `POST /api/admin/tests/:id/sections` (Req 5.1).
export const TEST_SECTIONS_SEGMENT = 'sections';

// Sub-path appended to an admin Section route to reach its Questions
// collection, e.g. `POST /api/admin/sections/:id/questions` (Req 4.1).
export const SECTION_QUESTIONS_SEGMENT = 'questions';

// Sub-path appended to a Test route to reach its Attempts collection, e.g.
// `POST /api/tests/:id/attempts` and `POST /api/sections/:id/attempts` (Req 8.2, 9.1).
export const ATTEMPTS_SEGMENT = 'attempts';

// Sub-path appended to a Test route to start a fresh attempt while preserving
// history, e.g. `POST /api/tests/:id/retake` (Req 15).
export const TEST_RETAKE_SEGMENT = 'retake';

// Sub-paths appended to an attempt route for its lifecycle actions:
//   `POST /api/attempts/:id/pause`     (Req 10.1)
//   `POST /api/attempts/:id/resume`    (Req 10.3)
//   `POST /api/attempts/:id/responses` (Req 9.4)
//   `POST /api/attempts/:id/submit`    (Req 11.4)
export const ATTEMPT_PAUSE_SEGMENT = 'pause';
export const ATTEMPT_RESUME_SEGMENT = 'resume';
export const ATTEMPT_RESPONSES_SEGMENT = 'responses';
export const ATTEMPT_SUBMIT_SEGMENT = 'submit';

// Sub-path appended to an attempt route to fetch the in-scope Question content
// for the Test Player while the attempt is open, e.g.
// `GET /api/attempts/:id/questions` (Req 9.4).
export const ATTEMPT_QUESTIONS_SEGMENT = 'questions';

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
