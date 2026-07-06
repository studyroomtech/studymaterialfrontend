// Type declarations for the Study Material view page (Requirements 1.15, 1.17).

import type { HttpError } from "@/utils/http.types";

/**
 * Props for the rendered material content section of the view page. The section
 * displays the loaded Study Material's title and description, plus a download
 * action wired to `useDownload` (Req 5.1). File metadata (name, type, size) and
 * category tags are intentionally not shown to keep the view focused on the
 * title, description, and download action.
 */
export interface MaterialContentProps {
  /** The Study Material title. */
  title: string;
  /** The Study Material description; empty when none was provided. */
  description: string;
  /** The material's file name, used by the inline preview viewer. */
  fileName?: string;
  /** `true` while a download request is in flight (Req 7.3). */
  isDownloading: boolean;
  /** The most recent download failure, or `null` when none (Req 8.1). */
  downloadError: HttpError | null;
  /** Begin a download for the material (opens the Download Gate if needed). */
  onDownload: () => void;
  /** The loaded inline preview URL, or `null` before it is requested. */
  previewUrl: string | null;
  /** The Content-Type of the loaded preview (drives the viewer choice). */
  previewContentType: string;
  /** `true` while the inline preview URL is being prepared. */
  isPreviewing: boolean;
  /** Begin loading the inline preview (opens the Download Gate if needed). */
  onRequestPreview: () => void;
  /** Discard the current inline preview. */
  onClearPreview: () => void;
}

/**
 * Props for the Paid-Material entitlement gate rendered when the view request
 * returns `403 PAYMENT_REQUIRED` (Req 12.3). The gate shows the material's Price
 * and a pay call-to-action instead of content, and reports back once a Payment
 * grants an Entitlement so the caller can reload and show the content.
 */
export interface PaymentRequiredGateProps {
  /** The id of the Paid Material to unlock (drives the Payment initiation). */
  materialId: string;
  /**
   * Called once a Payment succeeds and the Learner is entitled, so the caller
   * can reload the view to fetch and display the now-accessible content
   * (Req 12.2, 12.6).
   */
  onEntitled: () => void;
}
