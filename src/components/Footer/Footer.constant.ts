// Constants for the Footer component (Requirement 1.16).
//
// Centralizes the footer's user-facing copy and external destinations so the
// component module stays free of constant-literal declarations.

// ---- YouTube -------------------------------------------------------------
// The YouTube channel the footer links to.
export const YOUTUBE_URL = "https://www.youtube.com/@SakshiFocusRoom";
// Leading label shown before the YouTube link.
export const YOUTUBE_PREFIX = "YouTube:";
// Accessible label for the YouTube link.
export const YOUTUBE_LABEL = "Visit our YouTube channel";

// ---- Support -------------------------------------------------------------
// The support email address surfaced in the footer.
export const SUPPORT_EMAIL = "studyroomsupport@gmail.com";
// Leading label shown before the support email link.
export const SUPPORT_PREFIX = "Support Email:";
// `mailto:` href built from the support email address.
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

// ---- Quote / brand -------------------------------------------------------
// Inspirational quote displayed as the footer's centerpiece.
export const FOOTER_QUOTE =
  "Education is not the filling of a pail, but the lighting of a fire.";
// Brand wordmark shown beside the logo in the bottom row.
export const BRAND_NAME = "STUDY FOCUS";
// Accessible label for the decorative brand logo.
export const BRAND_LOGO_LABEL = "Study Focus";
