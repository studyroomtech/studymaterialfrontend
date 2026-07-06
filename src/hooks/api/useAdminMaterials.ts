'use client';

// `useAdminMaterials` — Content Management Actions for an admin-signed-in user.
//
// There is no separate admin login: authorization comes from the learner Access
// Token (from `useAccessToken`) whose `roles` include `role_admin`. Every
// management call sends that token as the Bearer credential; when the signed-in
// user is not an admin, the call short-circuits to a typed authorization error
// WITHOUT contacting the Backend API (Req 10.4, 10.6).
//
//   - Material CRUD (`createMaterial` multipart upload, `updateMaterial` title/
//     description/price edit, `deleteMaterial`) and tag assignment.
//   - Category Type and Category management (create / rename / delete).
//
// A shared `{ isLoading, error }` state drives loading indicators and error
// messages while preserving the caller's current view on failure (Req 7.3,
// 8.1). Upload/edit optionally carry a Price (amount + Currency): `createMaterial`
// appends `priceAmount`/`currency` to the multipart form and `updateMaterial`
// includes them in the JSON PATCH body only when provided, so omitting them
// leaves the material Free (Req 11.13, 11.5, 11.14). The Backend API re-validates
// every Price (Req 11.15).

import { useCallback, useMemo, useState } from 'react';

import { httpRequest } from '@/utils/http';
import { HTTP_ERROR_KIND } from '@/utils/http.constant';
import type { HttpError, HttpRequestOptions, HttpResult } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import {
  ADMIN_API_ROUTES,
  ADMIN_MATERIAL_FORM_FIELDS,
  ADMIN_MATERIAL_TAGS_SEGMENT,
} from './useAdminMaterials.constant';
import type {
  AdminCategory,
  AdminCategoryType,
  AdminMaterial,
  AdminMutationResult,
  CreateCategoryInput,
  CreateMaterialInput,
  UpdateMaterialInput,
  UseAdminMaterialsResult,
} from './useAdminMaterials.types';
import { useAccessToken } from '../useAccessToken';

/**
 * A typed authorization error returned when a Content Management Action is
 * attempted by a caller who is not a signed-in admin. The request never reaches
 * the Backend API; this mirrors the authorization error the backend would
 * return for a non-admin caller (Req 10.7).
 */
const forbiddenError = (): HttpError => ({
  kind: HTTP_ERROR_KIND.api,
  message: 'You must be signed in as an administrator to perform this action.',
  status: 403,
  code: 'FORBIDDEN',
});

/** Encode a path segment for safe inclusion in a Backend API request URL. */
const seg = (value: string): string => encodeURIComponent(value);

export const useAdminMaterials = (): UseAdminMaterialsResult => {
  // Authorization is derived from the account (learner) Access Token whose
  // `roles` include `role_admin` — no separate admin login (Req 10.4).
  const { token, isAdmin, clearToken } = useAccessToken();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<HttpError | null>(null);

  /** Sign out entirely by discarding the account Access Token. */
  const logout = useCallback((): void => {
    setError(null);
    clearToken();
  }, [clearToken]);

  /**
   * Run an HTTP request while maintaining the shared loading/error state. The
   * prior request's error is cleared before the attempt; on failure the error
   * is recorded (but no successful `data` is otherwise held here). The typed
   * result is returned so callers can act on it directly.
   */
  const runRequest = useCallback(
    async <TData>(
      url: string,
      options: HttpRequestOptions,
    ): Promise<HttpResult<TData>> => {
      setIsLoading(true);
      setError(null);
      const result = await httpRequest<TData>(url, options);
      if (!result.ok) {
        setError(result.error);
      }
      setIsLoading(false);
      return result;
    },
    [],
  );

  /**
   * Run an authenticated Content Management Action, injecting the account
   * Bearer token. When the signed-in user is not an admin, the call
   * short-circuits to a typed authorization error without contacting the
   * Backend API (Req 10.4, 10.7).
   */
  const runAuthedRequest = useCallback(
    async <TData>(
      url: string,
      options: HttpRequestOptions = {},
    ): Promise<HttpResult<TData>> => {
      if (!isAdmin || token === null) {
        const authError = forbiddenError();
        setError(authError);
        setIsLoading(false);
        return { ok: false, error: authError };
      }
      const headers = {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
      return runRequest<TData>(url, { ...options, headers });
    },
    [isAdmin, token, runRequest],
  );

  const createMaterial = useCallback(
    async (
      input: CreateMaterialInput,
    ): Promise<AdminMutationResult<AdminMaterial>> => {
      // Multipart upload: build FormData and let the browser set the
      // `Content-Type` (with boundary); do not set it manually (Req 11.1).
      const form = new FormData();
      form.set(ADMIN_MATERIAL_FORM_FIELDS.title, input.title);
      if (input.description !== undefined) {
        form.set(ADMIN_MATERIAL_FORM_FIELDS.description, input.description);
      }
      form.set(ADMIN_MATERIAL_FORM_FIELDS.file, input.file);
      // Only append the Price when provided so a plain upload stays Free
      // (Req 11.14); the amount is sent as its integer paise string and the
      // Currency (INR) alongside it (Req 11.13). The Backend re-validates.
      if (input.priceAmount !== undefined && input.priceAmount !== null) {
        form.set(
          ADMIN_MATERIAL_FORM_FIELDS.priceAmount,
          String(input.priceAmount),
        );
      }
      if (input.currency !== undefined) {
        form.set(ADMIN_MATERIAL_FORM_FIELDS.currency, input.currency);
      }
      // Attach the selected/typed Category, Subject, and Job names as
      // JSON-encoded arrays; the Backend reuses existing values by name (within
      // the relevant Category Type) and auto-creates new ones.
      if (input.categories !== undefined && input.categories.length > 0) {
        form.set(
          ADMIN_MATERIAL_FORM_FIELDS.categories,
          JSON.stringify(input.categories),
        );
      }
      if (input.subjects !== undefined && input.subjects.length > 0) {
        form.set(
          ADMIN_MATERIAL_FORM_FIELDS.subjects,
          JSON.stringify(input.subjects),
        );
      }
      if (input.jobs !== undefined && input.jobs.length > 0) {
        form.set(ADMIN_MATERIAL_FORM_FIELDS.jobs, JSON.stringify(input.jobs));
      }

      return runAuthedRequest<AdminMaterial>(
        buildApiUrl(ADMIN_API_ROUTES.materials),
        {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: form,
        },
      );
    },
    [runAuthedRequest],
  );

  const updateMaterial = useCallback(
    (
      materialId: string,
      input: UpdateMaterialInput,
    ): Promise<AdminMutationResult<AdminMaterial>> =>
      runAuthedRequest<AdminMaterial>(
        buildApiUrl(`${ADMIN_API_ROUTES.materials}/${seg(materialId)}`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(input),
        },
      ),
    [runAuthedRequest],
  );

  const deleteMaterial = useCallback(
    (materialId: string): Promise<AdminMutationResult<void>> =>
      runAuthedRequest<void>(
        buildApiUrl(`${ADMIN_API_ROUTES.materials}/${seg(materialId)}`),
        { method: 'DELETE', headers: { Accept: 'application/json' } },
      ),
    [runAuthedRequest],
  );

  const assignTag = useCallback(
    (
      materialId: string,
      categoryId: string,
    ): Promise<AdminMutationResult<AdminMaterial>> =>
      runAuthedRequest<AdminMaterial>(
        buildApiUrl(
          `${ADMIN_API_ROUTES.materials}/${seg(materialId)}/${ADMIN_MATERIAL_TAGS_SEGMENT}`,
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ categoryId }),
        },
      ),
    [runAuthedRequest],
  );

  const removeTag = useCallback(
    (
      materialId: string,
      categoryId: string,
    ): Promise<AdminMutationResult<void>> =>
      runAuthedRequest<void>(
        buildApiUrl(
          `${ADMIN_API_ROUTES.materials}/${seg(materialId)}/${ADMIN_MATERIAL_TAGS_SEGMENT}/${seg(categoryId)}`,
        ),
        { method: 'DELETE', headers: { Accept: 'application/json' } },
      ),
    [runAuthedRequest],
  );

  const createCategoryType = useCallback(
    (name: string): Promise<AdminMutationResult<AdminCategoryType>> =>
      runAuthedRequest<AdminCategoryType>(
        buildApiUrl(ADMIN_API_ROUTES.categoryTypes),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ name }),
        },
      ),
    [runAuthedRequest],
  );

  const renameCategoryType = useCallback(
    (
      categoryTypeId: string,
      name: string,
    ): Promise<AdminMutationResult<AdminCategoryType>> =>
      runAuthedRequest<AdminCategoryType>(
        buildApiUrl(`${ADMIN_API_ROUTES.categoryTypes}/${seg(categoryTypeId)}`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ name }),
        },
      ),
    [runAuthedRequest],
  );

  const deleteCategoryType = useCallback(
    (categoryTypeId: string): Promise<AdminMutationResult<void>> =>
      runAuthedRequest<void>(
        buildApiUrl(`${ADMIN_API_ROUTES.categoryTypes}/${seg(categoryTypeId)}`),
        { method: 'DELETE', headers: { Accept: 'application/json' } },
      ),
    [runAuthedRequest],
  );

  const createCategory = useCallback(
    (input: CreateCategoryInput): Promise<AdminMutationResult<AdminCategory>> =>
      runAuthedRequest<AdminCategory>(buildApiUrl(ADMIN_API_ROUTES.categories), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(input),
      }),
    [runAuthedRequest],
  );

  const renameCategory = useCallback(
    (
      categoryId: string,
      name: string,
    ): Promise<AdminMutationResult<AdminCategory>> =>
      runAuthedRequest<AdminCategory>(
        buildApiUrl(`${ADMIN_API_ROUTES.categories}/${seg(categoryId)}`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ name }),
        },
      ),
    [runAuthedRequest],
  );

  const deleteCategory = useCallback(
    (categoryId: string): Promise<AdminMutationResult<void>> =>
      runAuthedRequest<void>(
        buildApiUrl(`${ADMIN_API_ROUTES.categories}/${seg(categoryId)}`),
        { method: 'DELETE', headers: { Accept: 'application/json' } },
      ),
    [runAuthedRequest],
  );

  return useMemo(
    () => ({
      isAdmin,
      isLoading,
      error,
      logout,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      assignTag,
      removeTag,
      createCategoryType,
      renameCategoryType,
      deleteCategoryType,
      createCategory,
      renameCategory,
      deleteCategory,
    }),
    [
      isAdmin,
      isLoading,
      error,
      logout,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      assignTag,
      removeTag,
      createCategoryType,
      renameCategoryType,
      deleteCategoryType,
      createCategory,
      renameCategory,
      deleteCategory,
    ],
  );
};
