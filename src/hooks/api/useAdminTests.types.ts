// Type declarations for the admin Test-authoring hook (`useAdminTests.ts`).
// All type/interface declarations live here so the hook module stays free of
// type declarations (Req 1.15, 1.17), mirroring `useAdminMaterials.types.ts`.
//
// The Create/Edit inputs and response DTOs are the shared client-side Test
// Series shapes declared in `@/types/testSeries.types` (added in task 12.1) so
// the client is strictly typed against the Backend API authoring contract
// (backend `services/testSeries.service.types.ts`). They are re-exported here
// for callers that import them alongside the hook result. Following the
// platform serialization contract: timestamps are ISO 8601 UTC `Z` strings,
// monetary amounts are integer paise + Currency, and marks are decimal marks
// (Req 16.3, 16.5, R3). Authorization is derived from the account (learner)
// Access Token whose `roles` include `role_admin` — there is no separate admin
// login (Req 1.5, 1.6).

import type { HttpError, HttpResult } from '@/utils/http.types';
import type {
  AdminTestDto,
  CreateQuestionInput,
  CreateSectionInput,
  CreateTestInput,
  EditQuestionInput,
  EditSectionInput,
  QuestionDto,
  SectionDto,
  TestDto,
  TestSeriesListingDto,
} from '@/types/testSeries.types';

// Re-export the shared authoring inputs and response DTOs so callers can import
// them from the hook module surface (the shapes remain owned by
// `@/types/testSeries.types`).
export type {
  AdminTestDto,
  CreateQuestionInput,
  CreateSectionInput,
  CreateTestInput,
  EditQuestionInput,
  EditSectionInput,
  QuestionDto,
  SectionDto,
  TestDto,
  TestSeriesListingDto,
};

/**
 * The typed result of an admin Test-authoring call: either success with the
 * parsed response body, or a typed {@link HttpError} the caller can surface
 * while the hook also records it in its `error` state. A validation failure
 * (HTTP 422) carries per-field reasons via `HttpError.fields` for inline
 * field-level errors; other failures are surfaced as a submit error (Req 2.5,
 * 3.5, 4.4, 8.1).
 */
export type AdminTestMutationResult<TData> = HttpResult<TData>;

/**
 * Value returned by {@link useAdminTests}. Authorization is derived from the
 * account (learner) Access Token whose `roles` include `role_admin` — there is
 * no separate admin login. Exposes the admin flag, shared loading/submitting/
 * error state for the most recent authoring action, and the Test/Section/
 * Question authoring operations (create Test, list Tests, load-for-edit, and
 * add/edit Section and Question) (Req 2.1, 3.1, 4.1, 5.1, 5.2). Every call sends
 * the account Bearer token; when the signed-in user is not an admin it resolves
 * to an authorization error without contacting the Backend API.
 */
export interface UseAdminTestsResult {
  /** `true` when the signed-in user's token holds `role_admin` (Req 1.6). */
  isAdmin: boolean;
  /** `true` while a read (list Tests / load-for-edit) request is in flight. */
  isLoading: boolean;
  /** `true` while a mutation (create/add/edit) request is in flight (Req 7.3). */
  isSubmitting: boolean;
  /** The typed failure of the most recent action, or `null` on success/idle (Req 8.1). */
  error: HttpError | null;

  /**
   * Create a Test (title 1–200, Timing Mode, positive overall Time Limit,
   * optional Price) via `POST /api/admin/tests` (Req 2.1).
   */
  createTest: (input: CreateTestInput) => Promise<AdminTestMutationResult<TestDto>>;

  /**
   * List the existing Tests for the authoring surface (via the deterministic
   * `GET /api/tests` Test Series listing) so an Admin can pick one to edit
   * (Req 5.3).
   */
  listTests: () => Promise<AdminTestMutationResult<TestSeriesListingDto[]>>;

  /**
   * Load a Test with its ordered Sections → Questions → Options for editing via
   * `GET /api/admin/tests/:id` (Req 5.3).
   */
  getTestForAdmin: (testId: string) => Promise<AdminTestMutationResult<AdminTestDto>>;

  /**
   * Add a Section (with its Questions/Options) to a Test via
   * `POST /api/admin/tests/:id/sections`; the Section persists independently and
   * no other Section is altered (Req 3.1, 5.1).
   */
  addSection: (
    testId: string,
    input: CreateSectionInput,
  ) => Promise<AdminTestMutationResult<SectionDto>>;

  /**
   * Edit a persisted Section (and optionally replace its Questions) via
   * `PATCH /api/admin/sections/:id`; no other Section is altered (Req 5.2, 5.5).
   */
  editSection: (
    sectionId: string,
    input: EditSectionInput,
  ) => Promise<AdminTestMutationResult<SectionDto>>;

  /**
   * Add a Question (text 1–2000, ≥2 Options each 1–1000, ≥1 correct) to a
   * Section via `POST /api/admin/sections/:id/questions` (Req 4.1).
   */
  addQuestion: (
    sectionId: string,
    input: CreateQuestionInput,
  ) => Promise<AdminTestMutationResult<QuestionDto>>;

  /**
   * Edit a persisted Question (optionally replacing its Options) via
   * `PATCH /api/admin/questions/:id` (Req 5.2).
   */
  editQuestion: (
    questionId: string,
    input: EditQuestionInput,
  ) => Promise<AdminTestMutationResult<QuestionDto>>;
}
