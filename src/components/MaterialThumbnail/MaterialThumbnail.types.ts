// Type declarations for the MaterialThumbnail component.
import type { MaterialThumbnail } from "@/hooks/api/apiHooks.types";

/** Props for {@link MaterialThumbnailView}. */
export interface MaterialThumbnailProps {
  /** The material id; seeds the default cover art when there are no images. */
  materialId: string;
  /** The material's thumbnails in upload order; empty/absent → default cover. */
  thumbnails?: MaterialThumbnail[];
  /** Class applied to the root (cover art, image wrapper, or carousel). */
  className?: string;
  /** Unique id for the default cover's SVG defs (defaults to `materialId`). */
  uid?: string;
  /**
   * Alt text base for the images ("<alt> 1", "<alt> 2", ...). Leave empty on
   * cards, where the surrounding link already names the material.
   */
  alt?: string;
}
