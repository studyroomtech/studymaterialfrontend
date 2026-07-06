// Constants for the NotesPreview component (Req 1.16, 1.17).

/** Heading for the preview section. */
export const PREVIEW_HEADING = "Preview";

/** Hint shown before a preview is loaded. */
export const PREVIEW_HINT =
  "Load an inline preview of these notes without downloading the file.";

/** Action labels. */
export const LOAD_PREVIEW_LABEL = "Load preview";
export const HIDE_PREVIEW_LABEL = "Hide preview";
export const OPEN_IN_NEW_TAB_LABEL = "Open in a new tab";

/** Accessible label announced while the preview URL is being prepared. */
export const PREVIEW_LOADING_LABEL = "Preparing preview…";

/** Title for the embedded preview frame (assistive tech). */
export const PREVIEW_FRAME_TITLE = "Study material preview";

/** Message shown when the file type cannot be rendered inline. */
export const PREVIEW_UNSUPPORTED_TEXT =
  "An inline preview isn't available for this file type. You can open it in a new tab or download it instead.";

/** Content-type prefixes/fragments used to choose a viewer. */
export const PREVIEW_PDF_TYPE = "application/pdf";
export const PREVIEW_IMAGE_PREFIX = "image/";
export const PREVIEW_TEXT_PREFIX = "text/";
export const PREVIEW_HTML_TYPE = "text/html";
