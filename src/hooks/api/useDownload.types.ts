// Type declarations for the `useDownload` orchestration hook (Req 6.1, 6.6,
// 6.8, 9.1). All type/interface declarations live here so the hook module stays
// free of type declarations (Req 1.15, 1.17).

import type { DownloadGateValues } from '@/components/DownloadGateModal/DownloadGateModal.types';
import type { HttpError } from '@/utils/http.types';

/** Which flavour of file access a pending Download Gate submission resumes. */
export type MaterialAccessMode = 'download' | 'preview';

/**
 * Response body of `POST /api/downloads/gate`: a freshly issued learner Access
 * Token and its lifetime in seconds (Req 6.5).
 */
export interface DownloadGateResponse {
  /** The issued learner JWT Access Token. */
  accessToken: string;
  /** Token lifetime in seconds (2592000 per Req 6.5). */
  expiresInSeconds: number;
}

/**
 * Response body of `POST /api/materials/:id/download`: a short-lived presigned
 * URL the browser follows to fetch the file bytes, the suggested file name, and
 * the URL lifetime in seconds (Req 6.8).
 */
export interface DownloadPresignResponse {
  /** The presigned Object Storage URL to follow for the download (Req 6.8). */
  downloadUrl: string;
  /** The suggested file name for the downloaded Study Material. */
  fileName: string;
  /** Lifetime of the presigned URL in seconds. */
  expiresInSeconds: number;
}

/**
 * Response body of `POST /api/materials/:id/preview`: a short-lived URL that
 * renders the file inline, its Content-Type (to pick a viewer), the file name,
 * and the URL lifetime in seconds.
 */
export interface PreviewPresignResponse {
  /** The URL to embed for an inline preview. */
  previewUrl: string;
  /** The MIME type of the previewed file (e.g. `application/pdf`). */
  contentType: string;
  /** The file name of the previewed Study Material. */
  fileName: string;
  /** Lifetime of the preview URL in seconds. */
  expiresInSeconds: number;
}

/**
 * Value returned by {@link useDownload}. The hook orchestrates the full download
 * flow — ensuring a valid Access Token (else surfacing the Download Gate),
 * calling the download endpoint with the Bearer token, and following the
 * returned presigned URL — while exposing loading/error state so the caller can
 * wire up a {@link DownloadGateModal} and render feedback.
 */
export interface UseDownloadResult {
  /**
   * Begin a download for the given Study Material. If a valid Access Token is
   * present the download proceeds immediately; otherwise the Download Gate is
   * opened and the download is deferred until it is submitted (Req 6.1, 6.6).
   */
  requestDownload: (materialId: string) => void;
  /**
   * Submit the Download Gate name + email: persists a User Record, issues an
   * Access Token, and then resumes the deferred download (Req 6.2, 6.5, 6.8).
   * Intended as the `onSubmit` handler for {@link DownloadGateModal}.
   */
  submitGate: (values: DownloadGateValues) => void;
  /** Dismiss the Download Gate without submitting; the download stays blocked. */
  cancelGate: () => void;
  /** Whether the Download Gate should be displayed (no valid token) (Req 6.1). */
  isGateOpen: boolean;
  /** `true` while the download endpoint request is in flight (Req 7.3). */
  isDownloading: boolean;
  /** `true` while the Download Gate submission is in flight (Req 7.3). */
  isSubmittingGate: boolean;
  /** The most recent download/gate failure, or `null` when none (Req 8.1). */
  error: HttpError | null;
  /** A user-facing gate submission error message for the modal (Req 8.1). */
  gateError?: string;
  /**
   * When true, the submitted email resolved to a Password-Protected Account:
   * the Download Gate should reveal a password field and require it before the
   * submission can succeed.
   */
  requirePassword: boolean;

  /**
   * Request an inline preview URL for the given Study Material. Reuses the same
   * Download Gate / token flow as {@link requestDownload}; on success the URL is
   * exposed via {@link previewUrl} instead of triggering a file download.
   */
  requestPreview: (materialId: string) => void;
  /** The inline preview URL once loaded, or `null` before/after clearing. */
  previewUrl: string | null;
  /** The Content-Type of the loaded preview (drives the viewer choice). */
  previewContentType: string;
  /** `true` while a preview URL request is in flight (Req 7.3). */
  isPreviewing: boolean;
  /** Discard the current preview URL. */
  clearPreview: () => void;
}
