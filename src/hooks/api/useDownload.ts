'use client';

// `useDownload` — orchestrate a Study Material download (Req 6.1, 6.6, 6.8, 9.1).
//
// The hook coordinates the full download flow described in the design's
// "Download Flow (Download Gate + Token)":
//   1. Ensure a valid learner Access Token via `useAccessToken`. When none is
//      present (or it is expired/invalid) the Download Gate is surfaced instead
//      of starting the download (Req 6.1, 6.7).
//   2. On gate submission, POST name + email to `/api/downloads/gate`, persist
//      the issued Access Token, and resume the deferred download (Req 6.2, 6.5).
//   3. POST to `/api/materials/:id/download` with the Bearer token; the backend
//      resolves the learner, records a Download Record, and returns a presigned
//      URL (Req 6.6, 6.8, 9.1).
//   4. Follow the returned presigned URL so the browser fetches the file bytes.
//
// A `401` from the download endpoint means the token expired/invalid between
// checks: the stored token is cleared and the Download Gate is re-opened so the
// learner re-identifies before the download proceeds (Req 6.7). Loading and
// error states are exposed so callers can drive indicators and messages
// without clearing user-entered data (Req 7.3, 8.1).

import { useCallback, useRef, useState } from 'react';

import type { DownloadGateValues } from '@/components/DownloadGateModal/DownloadGateModal.types';
import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import { buildApiUrl } from './apiClient';
import {
  API_ROUTES,
  MATERIAL_DOWNLOAD_ACTION,
  MATERIAL_PREVIEW_ACTION,
} from './apiClient.constant';
import {
  DOWNLOAD_UNAUTHORIZED_STATUS,
  GATE_PASSWORD_REQUIRED_CODE,
} from './useDownload.constant';
import type {
  DownloadGateResponse,
  DownloadPresignResponse,
  PreviewPresignResponse,
  UseDownloadResult,
} from './useDownload.types';
import type { MaterialAccessMode } from './useDownload.types';
import { useAccessToken } from '../useAccessToken';

/** JSON request headers shared by the gate and download POST calls. */
const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Follow a presigned URL so the browser downloads the file. A transient anchor
 * is used (rather than replacing `location`) so the current view is preserved;
 * the `download` hint applies for same-origin URLs and is harmless otherwise.
 */
const followPresignedUrl = (url: string, fileName: string): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.rel = 'noopener';
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

export const useDownload = (): UseDownloadResult => {
  const { token, hasValidToken, setToken, clearToken } = useAccessToken();

  const [isGateOpen, setIsGateOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isSubmittingGate, setIsSubmittingGate] = useState<boolean>(false);
  const [error, setError] = useState<HttpError | null>(null);
  const [gateError, setGateError] = useState<string | undefined>(undefined);
  const [requirePassword, setRequirePassword] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewContentType, setPreviewContentType] = useState<string>('');

  // The material + access mode awaiting the Download Gate; resumed once a valid
  // token is obtained (Req 6.1).
  const pendingMaterialIdRef = useRef<string | null>(null);
  const pendingModeRef = useRef<MaterialAccessMode>('download');

  // Call the download or preview endpoint with the Bearer token. On download,
  // follow the presigned URL; on preview, expose the returned inline URL. A 401
  // re-triggers the Download Gate (Req 6.6, 6.7, 6.8, 9.1).
  const performAction = useCallback(
    async (
      materialId: string,
      accessToken: string,
      mode: MaterialAccessMode,
    ): Promise<void> => {
      setError(null);
      if (mode === 'download') {
        setIsDownloading(true);
      } else {
        setIsPreviewing(true);
      }

      const action =
        mode === 'download' ? MATERIAL_DOWNLOAD_ACTION : MATERIAL_PREVIEW_ACTION;
      const url = buildApiUrl(
        `${API_ROUTES.material}/${encodeURIComponent(materialId)}/${action}`,
      );

      const result = await httpRequest<
        DownloadPresignResponse | PreviewPresignResponse
      >(url, {
        method: 'POST',
        headers: {
          ...JSON_HEADERS,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (mode === 'download') {
        setIsDownloading(false);
      } else {
        setIsPreviewing(false);
      }

      if (result.ok) {
        pendingMaterialIdRef.current = null;
        if (mode === 'download') {
          const data = result.data as DownloadPresignResponse;
          followPresignedUrl(data.downloadUrl, data.fileName);
        } else {
          const data = result.data as PreviewPresignResponse;
          setPreviewUrl(data.previewUrl);
          setPreviewContentType(data.contentType);
        }
        return;
      }

      // Token expired/invalid between checks: clear it and re-open the gate so
      // the learner re-identifies before the action proceeds (Req 6.7).
      if (result.error.status === DOWNLOAD_UNAUTHORIZED_STATUS) {
        clearToken();
        pendingMaterialIdRef.current = materialId;
        pendingModeRef.current = mode;
        setIsGateOpen(true);
        return;
      }

      setError(result.error);
    },
    [clearToken],
  );

  const startAction = useCallback(
    (materialId: string, mode: MaterialAccessMode): void => {
      setError(null);
      setGateError(undefined);
      setRequirePassword(false);

      // A valid Access Token lets the action proceed without the gate (Req 6.6).
      if (hasValidToken && token !== null) {
        pendingMaterialIdRef.current = materialId;
        pendingModeRef.current = mode;
        void performAction(materialId, token, mode);
        return;
      }

      // No valid token: surface the Download Gate and defer the action (Req 6.1).
      pendingMaterialIdRef.current = materialId;
      pendingModeRef.current = mode;
      setIsGateOpen(true);
    },
    [hasValidToken, token, performAction],
  );

  const requestDownload = useCallback(
    (materialId: string): void => {
      startAction(materialId, 'download');
    },
    [startAction],
  );

  const requestPreview = useCallback(
    (materialId: string): void => {
      startAction(materialId, 'preview');
    },
    [startAction],
  );

  const clearPreview = useCallback((): void => {
    setPreviewUrl(null);
    setPreviewContentType('');
  }, []);

  const submitGate = useCallback(
    async (values: DownloadGateValues): Promise<void> => {
      setIsSubmittingGate(true);
      setGateError(undefined);

      const result = await httpRequest<DownloadGateResponse>(
        buildApiUrl(API_ROUTES.downloadsGate),
        {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify(values),
          // The gate surfaces failures inline in the modal, so suppress the
          // global error toast to avoid a duplicate message.
          suppressErrorToast: true,
        },
      );

      setIsSubmittingGate(false);

      if (!result.ok) {
        // A protected account: reveal the password field and prompt for it
        // rather than treating this as a generic failure.
        if (
          result.error.status === DOWNLOAD_UNAUTHORIZED_STATUS &&
          result.error.code === GATE_PASSWORD_REQUIRED_CODE
        ) {
          setRequirePassword(true);
        }
        // Keep the gate open with the entered values preserved (Req 8.1).
        setGateError(result.error.message);
        return;
      }

      // Persist the issued token, close the gate, and resume the deferred
      // download using the fresh token (Req 6.2, 6.5, 6.8).
      setRequirePassword(false);
      setToken(result.data.accessToken);
      setIsGateOpen(false);

      const materialId = pendingMaterialIdRef.current;
      if (materialId !== null) {
        void performAction(materialId, result.data.accessToken, pendingModeRef.current);
      }
    },
    [setToken, performAction],
  );

  const cancelGate = useCallback((): void => {
    setIsGateOpen(false);
    setGateError(undefined);
    setRequirePassword(false);
    pendingMaterialIdRef.current = null;
  }, []);

  return {
    requestDownload,
    submitGate,
    cancelGate,
    isGateOpen,
    isDownloading,
    isSubmittingGate,
    error,
    gateError,
    requirePassword,
    requestPreview,
    previewUrl,
    previewContentType,
    isPreviewing,
    clearPreview,
  };
};
