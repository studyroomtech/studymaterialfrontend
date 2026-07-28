// Types for the pure catalog-tree utility (`catalogTree.ts`).
//
// The catalog tree models the browsable Material Catalog as an expandable tree
// of Category Types → Category Folder Nodes → (nested Folder Nodes | File Nodes),
// per Requirements 3.2–3.8. All declarations live here so the utility module
// itself stays free of type/interface declarations (Requirements 1.15, 1.17).

/** A single Tag assignment on a Study Material (a Category reference). */
export interface CatalogTag {
  categoryId: string;
  name: string;
}

/**
 * Catalog view of a Study Material. `tagsByCategoryType` is keyed by
 * `categoryTypeId`; each value lists the Tags assigned under that Category Type
 * (an empty array when the material has no Tags under that type).
 */
export interface CatalogMaterial {
  id: string;
  title: string;
  tagsByCategoryType: Record<string, CatalogTag[]>;
  /** The material's average rating, or `null` when it has no ratings yet. */
  averageRating?: number | null;
  /** The number of ratings the material has received (0 when none). */
  reviewCount?: number;
}

/** A Category (classification value) belonging to a single Category Type. */
export interface CatalogCategory {
  id: string;
  name: string;
  categoryTypeId: string;
}

/** A Category Type dimension (e.g., Subject, Job) with its Categories. */
export interface CatalogCategoryType {
  id: string;
  name: string;
  categories: CatalogCategory[];
}

/** The raw catalog data used to build a catalog tree. */
export interface CatalogInput {
  categoryTypes: CatalogCategoryType[];
  materials: CatalogMaterial[];
}

/** Discriminator for the two kinds of Catalog Node. */
export type CatalogNodeKind = 'folder' | 'file';

/** An expandable Folder Node representing a Category. */
export interface CatalogFolderNode {
  kind: 'folder';
  /** Stable, position-unique identifier used for expand/collapse state. */
  nodeId: string;
  categoryId: string;
  categoryTypeId: string;
  name: string;
  children: CatalogNode[];
}

/** A leaf File Node representing a single Study Material. */
export interface CatalogFileNode {
  kind: 'file';
  /** Stable, position-unique identifier for the file within the tree. */
  nodeId: string;
  materialId: string;
  title: string;
}

/** Any node in the catalog tree. */
export type CatalogNode = CatalogFolderNode | CatalogFileNode;

/** Top-level grouping of Category Folder Nodes under a Category Type. */
export interface CatalogTypeGroup {
  categoryTypeId: string;
  name: string;
  folders: CatalogFolderNode[];
}

/** A fully constructed catalog tree plus its empty-state determination. */
export interface CatalogTree {
  groups: CatalogTypeGroup[];
  /** True when the catalog contains no Study Materials (Requirements 3.7, 3.8). */
  isEmpty: boolean;
}

/** The expand/collapse visible state of a catalog tree. */
export interface CatalogTreeState {
  expandedNodeIds: ReadonlySet<string>;
}

/** A flattened, renderable node reflecting the current visible state. */
export interface VisibleCatalogNode {
  nodeId: string;
  kind: CatalogNodeKind;
  depth: number;
  label: string;
  hasChildren: boolean;
  expanded: boolean;
}

/** Internal lookup entry resolving a Category id to its display metadata. */
export interface CategoryLookupEntry {
  name: string;
  categoryTypeId: string;
}
