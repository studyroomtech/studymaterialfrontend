// Type declarations for the Study Material view page (Requirements 1.15, 1.17).

import type { MaterialFile } from "@/hooks/api/apiHooks.types";

/**
 * Props for the rendered material content section of the view page. The section
 * displays the loaded Study Material's title and description, plus a list of the
 * material's files — each with its own preview and download actions wired to
 * `useDownload` (Req 5.1). When the material carries no `files` (older
 * single-file materials), the section falls back to the material's primary
 * (per-note) preview/download so nothing breaks.
 */
export interface MaterialContentProps {
  /** The Study Material id (drives the per-file/primary download endpoints). */
  materialId: string;
  /** The Study Material title. */
  title: string;
  /** The Study Material description; empty when none was provided. */
  description: string;
  /** The material's primary file name, used by the single-file fallback viewer. */
  fileName?: string;
  /** Every file (PDF) belonging to the material, ordered primary-first. */
  files?: MaterialFile[];
}

/**
 * Props for a single file row in the material's files list. Each row owns its
 * own `useDownload` instance so its preview/download state (and Download Gate)
 * is independent of the other files (Req 5.1, 6.1).
 */
export interface MaterialFileRowProps {
  /** The id of the material the file belongs to. */
  materialId: string;
  /** The file to render preview/download actions for. */
  file: MaterialFile;
}

/**
 * Props for the single-file fallback shown when a material carries no `files`
 * list. It targets the material's primary (per-note) preview/download endpoints
 * and preserves the auto-loaded inline preview behavior.
 */
export interface SingleFileFallbackProps {
  /** The id of the material to preview/download. */
  materialId: string;
  /** The material's primary file name, used by the inline preview viewer. */
  fileName?: string;
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
