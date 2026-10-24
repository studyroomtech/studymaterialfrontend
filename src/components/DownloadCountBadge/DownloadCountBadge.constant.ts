// Constants for the DownloadCountBadge component.

export const DOWNLOAD_ICON = "↓";
export const DOWNLOAD_SINGULAR_LABEL = "download";
export const DOWNLOAD_PLURAL_LABEL = "downloads";

/** Compact count formatting, e.g. 1,250 → "1.3K". */
export const DOWNLOAD_COUNT_FORMATTER = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
