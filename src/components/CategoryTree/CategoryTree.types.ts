// Type declarations for the CategoryTree component (Requirements 1.15, 1.17).
//
// The CategoryTree renders the browsable Material Catalog as an expandable tree
// of Folder Nodes (Categories) and File Nodes (Study Materials), driven entirely
// by the pure `catalogTree` utility (Requirements 3.1–3.6).

import type {
  CatalogCategoryType,
  CatalogMaterial,
} from "../../utils/catalogTree.types";

/**
 * Props for the CategoryTree component.
 *
 * The tree is built from the raw catalog data (`categoryTypes` + `materials`)
 * using the pure `catalogTree` utility, so ordering and node structure are
 * deterministic and independent of input ordering (Req 3.2).
 */
export interface CategoryTreeProps {
  /** Supported Category Types with their Categories (Req 3.1, 3.2). */
  categoryTypes: CatalogCategoryType[];
  /** The Study Materials to place within the tree (Req 3.5, 3.6). */
  materials: CatalogMaterial[];
  /**
   * Invoked with a Study Material id when a Learner selects a File Node so the
   * parent can view the corresponding material (Req 3.5).
   */
  onSelectMaterial: (materialId: string) => void;
  /** Optional additional class name applied to the tree container. */
  className?: string;
}
