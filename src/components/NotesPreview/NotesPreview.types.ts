// Type declarations for the NotesPreview component (Req 1.15, 1.17).

/**
 * Props for {@link NotesPreview}. The component renders an inline preview of a
 * Study Material's file. The parent owns the preview lifecycle (via the
 * `useDownload` hook): it triggers `onRequestPreview` to fetch a short-lived
 * inline URL, then passes the resulting `previewUrl` + `contentType` back in.
 */
export interface NotesPreviewProps {
  /** The inline preview URL once loaded, or `null` before it is requested. */
  previewUrl: string | null;
  /** The MIME type of the loaded preview, used to choose a viewer. */
  contentType: string;
  /** The file name of the material (used for the image alt / frame title). */
  fileName?: string;
  /** `true` while the preview URL is being prepared. */
  isLoading: boolean;
  /** Begin loading the inline preview (opens the Download Gate if needed). */
  onRequestPreview: () => void;
  /** Discard the current preview. */
  onClose: () => void;
}
