// DownloadCountBadge — a compact download-count chip (e.g. "↓ 1.3K downloads").
//
// Mirrors RatingBadge: renders nothing until the material has at least one
// download, so new notes don't advertise a zero count.

"use client";
import { useAccessToken } from "@/hooks/useAccessToken";
import styles from "./DownloadCountBadge.module.scss";
import {
  DOWNLOAD_COUNT_FORMATTER,
  DOWNLOAD_ICON,
  DOWNLOAD_PLURAL_LABEL,
  DOWNLOAD_SINGULAR_LABEL,
} from "./DownloadCountBadge.constant";
import type { DownloadCountBadgeProps } from "./DownloadCountBadge.types";

function DownloadCountBadge({
  downloadCount,
  size = "sm",
  className,
}: DownloadCountBadgeProps) {
  const { hasValidToken } = useAccessToken();
  if (!hasValidToken || downloadCount === undefined || downloadCount <= 0) {
    return null;
  }

  const label =
    downloadCount === 1 ? DOWNLOAD_SINGULAR_LABEL : DOWNLOAD_PLURAL_LABEL;
  const rootClassName = [styles.badge, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootClassName} aria-label={`${downloadCount} ${label}`}>
      <span className={styles.icon} aria-hidden="true">
        {DOWNLOAD_ICON}
      </span>
      <span aria-hidden="true">
        {DOWNLOAD_COUNT_FORMATTER.format(downloadCount)} {label}
      </span>
    </span>
  );
}

export default DownloadCountBadge;
