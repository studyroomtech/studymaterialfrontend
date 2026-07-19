'use client';

// `useAdminTests` — Test-authoring actions for an admin-signed-in user.
//
// There is no separate admin login: authorization comes from the account
// (learner) Access Token (from `useAccessToken`) whose `roles` include
// `role_admin`. Every authoring call sends that token as the Bearer credential;
// when the signed-in user is not an admin, the mutation short-circuits to a
// typed authorization error WITHOUT contacting the Backend API (mirroring
// `useAdminMaterials`).
//
// The hook exposes the Test/Section/Question authoring operations required by
// the authoring surface: create Test, list Tests, load-for-edit, add/edit
// Section (with its Questions/Options), and add/edit Question. Failures reuse
// the shared typed `HttpError` envelope: a validation failure (HTTP 422)
// carries per-field reasons via `HttpError.fields` (surfaced inline as
// per-field errors), while any other failure is surfaced as a submit error
// (Req 2.5, 3.5, 4.4, 5.1, 5.2). A split `{ isLoading, isSubmitting }` state
// drives read vs. mutation indicators while preserving the caller's view on
// failure.

import { useCallback, useMemo, useState } from 'react';

import { httpRequest } from '@/utils/http';
import { HTTP_ERROR_KIND } from '@/utils/http.constant';
import type { HttpError, HttpRequestOptions, HttpResult } from '@/utils/http.types';
import type { TestListingsResponse } from '@/types/testSeries.types';

import { buildApiUrl } from './apiClient';
import {
  API_ROUTES,
  SECTION_QUESTIONS_SEGMENT,
  TEST_SECTIONS_SEGMENT,
} from './apiClient.constant';
import type {
  AdminTestDto,
  AdminTestMutationResult,
  CreateQuestionInput,
  CreateSectionInput,
  CreateTestInput,
  EditQuestionInput,
  EditSectionInput,
  QuestionDto,
  SectionDto,
  TestDto,
  TestSeriesListingDto,
  UseAdminTestsResult,
} from './useAdminTests.types';
import { useAccessToken } from '../useAccessToken';

/**
 * A typed authorization error returned when an authoring action is attempted by
 * a caller who is not a signed-in admin. The request never reaches the Backend
 * API; this mirrors the authorization error the backend would return for a
 * non-admin caller.
 */
const forbiddenError = (): HttpError => ({
  kind: HTTP_ERROR_KIND.api,
  message: 'You must be signed in as an administrator to perform this action.',
  status: 403,
  code: 'FORBIDDEN',
});

/** JSON request headers shared by the create/edit authoring mutations. */
const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

/** Encode a path segment for safe inclusion in a Backend API request URL. */
const seg = (value: string): string => encodeURIComponent(value);

/**
 * Unwrap the named-envelope response bodies the admin Test endpoints return
 * (`{ test }`, `{ section }`, `{ question }`) into the inner DTO, preserving a
 * failure result unchanged. The Backend API wraps each entity under a key
 * (mirroring `{ material }`), so the hook must pick the inner value before
 * handing it to callers.
 */
function unwrap<TEnvelope, TData>(
  result: HttpResult<TEnvelope>,
  pick: (envelope: TEnvelope) => TData,
): HttpResult<TData> {
  if (!result.ok) {
    return result;
  }
  return { ok: true, status: result.status, data: pick(result.data) };
}

export const useAdminTests = (): UseAdminTestsResult => {
  // Authorization is derived from the account (learner) Access Token whose
  // `roles` include `role_admin` — no separate admin login.
  const { token, isAdmin } = useAccessToken();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<HttpError | null>(null);

  /**
   * Run an HTTP request while maintaining the shared error state and the
   * supplied in-flight flag (reads toggle `isLoading`; mutations toggle
   * `isSubmitting`). The prior error is cleared before the attempt; on failure
   * the typed error is recorded (a 422 carries `fields` for per-field errors,
   * any other failure is a submit/read error). The typed result is returned so
   * callers can act on it directly.
   */
  const runRequest = useCallback(
    async <TData>(
      setInFlight: (value: boolean) => void,
      url: string,
      options: HttpRequestOptions,
    ): Promise<HttpResult<TData>> => {
      setInFlight(true);
      setError(null);
      const result = await httpRequest<TData>(url, options);
      if (!result.ok) {
        setError(result.error);
      }
      setInFlight(false);
      return result;
    },
    [],
  );

  /**
   * Run an authenticated authoring action, injecting the account Bearer token.
   * When the signed-in user is not an admin, the call short-circuits to a typed
   * authorization error without contacting the Backend API.
   */
  const runAuthedRequest = useCallback(
    async <TData>(
      setInFlight: (value: boolean) => void,
      url: string,
      options: HttpRequestOptions = {},
    ): Promise<HttpResult<TData>> => {
      if (!isAdmin || token === null) {
        const authError = forbiddenError();
        setError(authError);
        setInFlight(false);
        return { ok: false, error: authError };
      }
      const headers = {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
      return runRequest<TData>(setInFlight, url, { ...options, headers });
    },
    [isAdmin, token, runRequest],
  );

  const createTest = useCallback(
    async (
      input: CreateTestInput,
    ): Promise<AdminTestMutationResult<TestDto>> => {
      const result = await runAuthedRequest<{ test: TestDto }>(
        setIsSubmitting,
        buildApiUrl(API_ROUTES.adminTests),
        { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(input) },
      );
      return unwrap(result, (envelope) => envelope.test);
    },
    [runAuthedRequest],
  );

  const listTests = useCallback(async (): Promise<
    AdminTestMutationResult<TestSeriesListingDto[]>
  > => {
    // The authoring surface reuses the deterministic `GET /api/tests` listing
    // (Test Series + Sectional). Only the Test Series entries are needed here,
    // so the response is narrowed to `testSeries` before returning.
    const result = await runAuthedRequest<TestListingsResponse>(
      setIsLoading,
      buildApiUrl(API_ROUTES.tests),
      { method: 'GET', headers: { Accept: 'application/json' } },
    );
    if (!result.ok) {
      return result;
    }
    return { ok: true, status: result.status, data: result.data.testSeries };
  }, [runAuthedRequest]);

  const getTestForAdmin = useCallback(
    async (
      testId: string,
    ): Promise<AdminTestMutationResult<AdminTestDto>> => {
      const result = await runAuthedRequest<{ test: AdminTestDto }>(
        setIsLoading,
        buildApiUrl(`${API_ROUTES.adminTests}/${seg(testId)}`),
        { method: 'GET', headers: { Accept: 'application/json' } },
      );
      return unwrap(result, (envelope) => envelope.test);
    },
    [runAuthedRequest],
  );

  const addSection = useCallback(
    async (
      testId: string,
      input: CreateSectionInput,
    ): Promise<AdminTestMutationResult<SectionDto>> => {
      const result = await runAuthedRequest<{ section: SectionDto }>(
        setIsSubmitting,
        buildApiUrl(
          `${API_ROUTES.adminTests}/${seg(testId)}/${TEST_SECTIONS_SEGMENT}`,
        ),
        { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(input) },
      );
      return unwrap(result, (envelope) => envelope.section);
    },
    [runAuthedRequest],
  );

  const editSection = useCallback(
    async (
      sectionId: string,
      input: EditSectionInput,
    ): Promise<AdminTestMutationResult<SectionDto>> => {
      const result = await runAuthedRequest<{ section: SectionDto }>(
        setIsSubmitting,
        buildApiUrl(`${API_ROUTES.adminSections}/${seg(sectionId)}`),
        { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(input) },
      );
      return unwrap(result, (envelope) => envelope.section);
    },
    [runAuthedRequest],
  );

  const addQuestion = useCallback(
    async (
      sectionId: string,
      input: CreateQuestionInput,
    ): Promise<AdminTestMutationResult<QuestionDto>> => {
      const result = await runAuthedRequest<{ question: QuestionDto }>(
        setIsSubmitting,
        buildApiUrl(
          `${API_ROUTES.adminSections}/${seg(sectionId)}/${SECTION_QUESTIONS_SEGMENT}`,
        ),
        { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(input) },
      );
      return unwrap(result, (envelope) => envelope.question);
    },
    [runAuthedRequest],
  );

  const editQuestion = useCallback(
    async (
      questionId: string,
      input: EditQuestionInput,
    ): Promise<AdminTestMutationResult<QuestionDto>> => {
      const result = await runAuthedRequest<{ question: QuestionDto }>(
        setIsSubmitting,
        buildApiUrl(`${API_ROUTES.adminQuestions}/${seg(questionId)}`),
        { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(input) },
      );
      return unwrap(result, (envelope) => envelope.question);
    },
    [runAuthedRequest],
  );

  return useMemo(
    () => ({
      isAdmin,
      isLoading,
      isSubmitting,
      error,
      createTest,
      listTests,
      getTestForAdmin,
      addSection,
      editSection,
      addQuestion,
      editQuestion,
    }),
    [
      isAdmin,
      isLoading,
      isSubmitting,
      error,
      createTest,
      listTests,
      getTestForAdmin,
      addSection,
      editSection,
      addQuestion,
      editQuestion,
    ],
  );
};
