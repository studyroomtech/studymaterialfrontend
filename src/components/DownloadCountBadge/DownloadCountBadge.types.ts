// Types for the DownloadCountBadge component.

export interface DownloadCountBadgeProps {
  /** Unique downloaders. The badge renders nothing when this is 0/absent. */
  downloadCount?: number;
  /** Visual size. Defaults to `"sm"`. */
  size?: "sm" | "md";
  /** Optional extra class name applied to the root element. */
  className?: string;
}
