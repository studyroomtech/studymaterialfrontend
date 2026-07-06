// NotesPreview — inline preview of a Study Material's file.
//
// Presentational component driven by the parent's `useDownload` preview state.
// Before a preview is requested it shows a "Load preview" call to action (so
// the Download Gate isn't triggered on page load); once a short-lived inline
// URL is available it renders an appropriate viewer for the file's Content-Type
// (PDF/text/HTML via <iframe>, images via <img>), falling back to an
// "open in a new tab" affordance for types that can't be embedded. All styling
// lives in `NotesPreview.module.scss` (no inline CSS, Req 1.19).

"use client";

import Button from "@/components/Button/Button";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";

import styles from "./NotesPreview.module.scss";
import {
  HIDE_PREVIEW_LABEL,
  LOAD_PREVIEW_LABEL,
  OPEN_IN_NEW_TAB_LABEL,
  PREVIEW_FRAME_TITLE,
  PREVIEW_HEADING,
  PREVIEW_HINT,
  PREVIEW_HTML_TYPE,
  PREVIEW_IMAGE_PREFIX,
  PREVIEW_LOADING_LABEL,
  PREVIEW_PDF_TYPE,
  PREVIEW_TEXT_PREFIX,
  PREVIEW_UNSUPPORTED_TEXT,
} from "./NotesPreview.constant";
import type { NotesPreviewProps } from "./NotesPreview.types";

/** Whether a Content-Type can be embedded in an <iframe>. */
function isFrameable(contentType: string): boolean {
  const type = contentType.toLowerCase();
  return (
    type.startsWith(PREVIEW_PDF_TYPE) ||
    type === PREVIEW_HTML_TYPE ||
    type.startsWith(PREVIEW_TEXT_PREFIX)
  );
}

/** Whether a Content-Type is an image that can be shown via <img>. */
function isImage(contentType: string): boolean {
  return contentType.toLowerCase().startsWith(PREVIEW_IMAGE_PREFIX);
}

function NotesPreview({
  previewUrl,
  contentType,
  fileName,
  isLoading,
  onRequestPreview,
  onClose,
}: NotesPreviewProps) {
  return (
    <section className={styles.preview}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{PREVIEW_HEADING}</h2>
        {previewUrl !== null ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            {HIDE_PREVIEW_LABEL}
          </Button>
        ) : null}
      </div>

      {previewUrl === null && !isLoading ? (
        <div className={styles.placeholder}>
          <p className={styles.hint}>{PREVIEW_HINT}</p>
          <Button variant="secondary" onClick={onRequestPreview}>
            {LOAD_PREVIEW_LABEL}
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingIndicator label={PREVIEW_LOADING_LABEL} className={styles.loading} />
      ) : null}

      {previewUrl !== null && !isLoading ? (
        <div className={styles.viewer}>
          {isFrameable(contentType) ? (
            <iframe
              className={styles.frame}
              src={previewUrl}
              title={fileName ?? PREVIEW_FRAME_TITLE}
            />
          ) : isImage(contentType) ? (
            <img
              className={styles.image}
              src={previewUrl}
              alt={fileName ?? PREVIEW_FRAME_TITLE}
            />
          ) : (
            <div className={styles.unsupported}>
              <p className={styles.hint}>{PREVIEW_UNSUPPORTED_TEXT}</p>
              <a
                className={styles.newTabLink}
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {OPEN_IN_NEW_TAB_LABEL}
              </a>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default NotesPreview;
