// Pure catalog-tree utility.
//
// This module contains only pure, deterministic functions (no I/O, no shared
// mutable state) so its behavior can be property-tested later. It builds the
// browsable Material Catalog tree, manages expand/collapse visible state, and
// determines the empty state.
//
// Requirements coverage:
//   - 3.2: Categories render as Folder Nodes in a consistent order across views
//          (`buildCatalogTree` sorts deterministically regardless of input order).
//   - 3.3/3.4: expand/collapse visible-state transitions round-trip
//          (`expandNode` / `collapseNode` / `toggleNode` + `getVisibleNodes`).
//   - 3.5: a material tagged with only the selected Category renders as a File
//          Node directly in the expanded list.
//   - 3.6: materials distinguished by additional Categories render beneath
//          nested Folder Nodes for those additional Categories.
//   - 3.7/3.8: empty state is shown iff the catalog has no materials
//          (`isCatalogEmpty` / `shouldShowEmptyState` / `shouldShowMaterials`).

import type {
  CatalogFileNode,
  CatalogFolderNode,
  CatalogInput,
  CatalogMaterial,
  CatalogNode,
  CatalogTree,
  CatalogTreeState,
  CatalogTypeGroup,
  CategoryLookupEntry,
  VisibleCatalogNode,
} from './catalogTree.types';

/** Total order over strings, independent of locale, for deterministic sorting. */
const compareStrings = (a: string, b: string): number => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

/** Collect the de-duplicated set of Category ids a material is tagged with. */
const collectMaterialCategoryIds = (material: CatalogMaterial): string[] => {
  const ids = new Set<string>();
  for (const tags of Object.values(material.tagsByCategoryType)) {
    for (const tag of tags) {
      ids.add(tag.categoryId);
    }
  }
  return [...ids];
};

/** Build a lookup from Category id to its display metadata. */
const buildCategoryLookup = (
  input: CatalogInput,
): Map<string, CategoryLookupEntry> => {
  const lookup = new Map<string, CategoryLookupEntry>();
  for (const categoryType of input.categoryTypes) {
    for (const category of categoryType.categories) {
      lookup.set(category.id, {
        name: category.name,
        categoryTypeId: category.categoryTypeId,
      });
    }
  }
  return lookup;
};

/** Deterministic, position-unique node id for a Folder Node at a category path. */
const makeFolderNodeId = (pathIds: readonly string[]): string =>
  `folder:${pathIds.join('/')}`;

/** Deterministic, position-unique node id for a File Node at a category path. */
const makeFileNodeId = (
  pathIds: readonly string[],
  materialId: string,
): string => `file:${pathIds.join('/')}#${materialId}`;

/**
 * Build the children of the folder reached by `pathIds` from the materials that
 * are tagged with every Category on the path.
 *
 * A material whose full Category set is contained within the path (i.e. it has
 * no further distinguishing Category) becomes a File Node directly (Req 3.5).
 * A material with one or more additional Categories is placed beneath a nested
 * Folder Node for each of those additional Categories (Req 3.6). Recursion
 * terminates because each nested level adds a new Category to the path, and a
 * material's Category set is finite.
 */
const buildChildren = (
  materials: readonly CatalogMaterial[],
  pathIds: readonly string[],
  lookup: Map<string, CategoryLookupEntry>,
): CatalogNode[] => {
  const pathSet = new Set(pathIds);

  // File Nodes: materials with no Category beyond those already on the path.
  const fileNodes: CatalogFileNode[] = materials
    .filter((material) =>
      collectMaterialCategoryIds(material).every((id) => pathSet.has(id)),
    )
    .map((material) => ({
      kind: 'file' as const,
      nodeId: makeFileNodeId(pathIds, material.id),
      materialId: material.id,
      title: material.title,
    }))
    .sort(
      (a, b) =>
        compareStrings(a.title, b.title) ||
        compareStrings(a.materialId, b.materialId),
    );

  // Additional Categories that further distinguish the remaining materials.
  const additionalIds = new Set<string>();
  for (const material of materials) {
    for (const id of collectMaterialCategoryIds(material)) {
      if (!pathSet.has(id) && lookup.has(id)) {
        additionalIds.add(id);
      }
    }
  }

  const folderNodes: CatalogFolderNode[] = [...additionalIds]
    .map((categoryId) => {
      const info = lookup.get(categoryId) as CategoryLookupEntry;
      const childMaterials = materials.filter((material) =>
        collectMaterialCategoryIds(material).includes(categoryId),
      );
      const childPath = [...pathIds, categoryId];
      return {
        kind: 'folder' as const,
        nodeId: makeFolderNodeId(childPath),
        categoryId,
        categoryTypeId: info.categoryTypeId,
        name: info.name,
        children: buildChildren(childMaterials, childPath, lookup),
      };
    })
    .sort(
      (a, b) =>
        compareStrings(a.name, b.name) ||
        compareStrings(a.categoryId, b.categoryId),
    );

  // Folders precede files, each group in its own deterministic order.
  return [...folderNodes, ...fileNodes];
};

/**
 * Build the catalog tree from raw catalog data. The result is deterministic and
 * independent of the ordering of the input arrays: Category Types, Folder Nodes,
 * nested Folder Nodes, and File Nodes are all sorted by name then id, so building
 * twice from the same underlying data yields the same tree (Req 3.2).
 */
export const buildCatalogTree = (input: CatalogInput): CatalogTree => {
  const lookup = buildCategoryLookup(input);

  const groups: CatalogTypeGroup[] = input.categoryTypes
    .map((categoryType) => {
      const folders: CatalogFolderNode[] = categoryType.categories
        .map((category) => {
          const pathIds = [category.id];
          const taggedMaterials = input.materials.filter((material) =>
            collectMaterialCategoryIds(material).includes(category.id),
          );
          return {
            kind: 'folder' as const,
            nodeId: makeFolderNodeId(pathIds),
            categoryId: category.id,
            categoryTypeId: categoryType.id,
            name: category.name,
            children: buildChildren(taggedMaterials, pathIds, lookup),
          };
        })
        .sort(
          (a, b) =>
            compareStrings(a.name, b.name) ||
            compareStrings(a.categoryId, b.categoryId),
        );

      return {
        categoryTypeId: categoryType.id,
        name: categoryType.name,
        folders,
      };
    })
    .sort(
      (a, b) =>
        compareStrings(a.name, b.name) ||
        compareStrings(a.categoryTypeId, b.categoryTypeId),
    );

  return {
    groups,
    isEmpty: isCatalogEmpty(input),
  };
};

/** True when the Material Catalog contains no Study Materials (Req 3.7, 3.8). */
export const isCatalogEmpty = (input: CatalogInput): boolean =>
  input.materials.length === 0;

/** Whether the empty-state message should be displayed (Req 3.8). */
export const shouldShowEmptyState = (input: CatalogInput): boolean =>
  isCatalogEmpty(input);

/**
 * Whether Study Materials should be displayed (Req 3.7). This is the exact
 * complement of `shouldShowEmptyState`, making the two mutually exclusive.
 */
export const shouldShowMaterials = (input: CatalogInput): boolean =>
  !isCatalogEmpty(input);

/** Create the initial visible state with every Folder Node collapsed. */
export const createInitialState = (): CatalogTreeState => ({
  expandedNodeIds: new Set<string>(),
});

/** Whether the given Folder Node is currently expanded. */
export const isExpanded = (
  state: CatalogTreeState,
  nodeId: string,
): boolean => state.expandedNodeIds.has(nodeId);

/**
 * Expand a Folder Node. Returns the same state when already expanded; otherwise
 * returns a new state with `nodeId` added. Pure — never mutates the input.
 */
export const expandNode = (
  state: CatalogTreeState,
  nodeId: string,
): CatalogTreeState => {
  if (state.expandedNodeIds.has(nodeId)) {
    return state;
  }
  const expandedNodeIds = new Set(state.expandedNodeIds);
  expandedNodeIds.add(nodeId);
  return { expandedNodeIds };
};

/**
 * Collapse a Folder Node. Returns the same state when already collapsed;
 * otherwise returns a new state with `nodeId` removed. Pure — never mutates.
 *
 * Together with `expandNode` this guarantees a round-trip on visible state:
 * expanding a collapsed node then collapsing it (or collapsing an expanded node
 * then expanding it) restores the original expanded-id set, and therefore the
 * original set of visible Catalog Nodes (Req 3.3, 3.4).
 */
export const collapseNode = (
  state: CatalogTreeState,
  nodeId: string,
): CatalogTreeState => {
  if (!state.expandedNodeIds.has(nodeId)) {
    return state;
  }
  const expandedNodeIds = new Set(state.expandedNodeIds);
  expandedNodeIds.delete(nodeId);
  return { expandedNodeIds };
};

/** Toggle a Folder Node between expanded and collapsed. */
export const toggleNode = (
  state: CatalogTreeState,
  nodeId: string,
): CatalogTreeState =>
  state.expandedNodeIds.has(nodeId)
    ? collapseNode(state, nodeId)
    : expandNode(state, nodeId);

/**
 * Flatten the tree into the ordered list of currently visible nodes. Top-level
 * Folder Nodes are always visible; a folder's children are visible only while
 * that folder is expanded. The result is a deterministic function of the tree
 * and the expanded-id set, so it round-trips with `expandNode`/`collapseNode`.
 */
export const getVisibleNodes = (
  tree: CatalogTree,
  state: CatalogTreeState,
): VisibleCatalogNode[] => {
  const result: VisibleCatalogNode[] = [];

  const visit = (node: CatalogNode, depth: number): void => {
    const expanded =
      node.kind === 'folder' && state.expandedNodeIds.has(node.nodeId);
    result.push({
      nodeId: node.nodeId,
      kind: node.kind,
      depth,
      label: node.kind === 'folder' ? node.name : node.title,
      hasChildren: node.kind === 'folder' && node.children.length > 0,
      expanded,
    });
    if (node.kind === 'folder' && expanded) {
      for (const child of node.children) {
        visit(child, depth + 1);
      }
    }
  };

  for (const group of tree.groups) {
    for (const folder of group.folders) {
      visit(folder, 0);
    }
  }

  return result;
};
