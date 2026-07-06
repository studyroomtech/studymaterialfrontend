// CategoryTree component (Requirements 3.1–3.6).
//
// Renders the browsable Material Catalog as an expandable tree. All tree
// construction, ordering, expand/collapse state, and node flattening are
// delegated to the pure `catalogTree` utility so this component stays a thin,
// accessible rendering layer:
//
//   - `buildCatalogTree` builds a deterministic tree from the raw catalog data,
//     so Categories render as Folder Nodes in a consistent order (Req 3.1, 3.2).
//   - `createInitialState` / `toggleNode` manage the expand/collapse visible
//     state; expanding a Folder Node reveals its children and collapsing hides
//     them (Req 3.3, 3.4).
//   - `getVisibleNodes` flattens the tree into the currently visible, depth-
//     annotated rows: single-category materials appear as File Nodes and
//     further-distinguished materials appear beneath nested Folder Nodes
//     (Req 3.5, 3.6).
//
// Styling is authored entirely in `CategoryTree.module.scss` (no inline CSS,
// Req 1.19); indentation is applied via per-depth classes.

"use client";

import { useCallback, useMemo, useState } from "react";

import styles from "./CategoryTree.module.scss";
import {
  COLLAPSED_INDICATOR,
  EXPANDED_INDICATOR,
  FILE_INDICATOR,
  MAX_INDENT_DEPTH,
} from "./CategoryTree.constant";
import type { CategoryTreeProps } from "./CategoryTree.types";
import {
  buildCatalogTree,
  createInitialState,
  getVisibleNodes,
  toggleNode,
} from "../../utils/catalogTree";
import type {
  CatalogNode,
  CatalogTreeState,
} from "../../utils/catalogTree.types";

/** Join class names, dropping any falsy entries. */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/**
 * Build a lookup from a File Node's stable `nodeId` to its Study Material id.
 * The flattened visible nodes carry only display data, so this map lets the
 * component resolve which material a selected File Node refers to (Req 3.5).
 */
function buildMaterialIdByNodeId(
  nodes: readonly CatalogNode[],
  target: Map<string, string>,
): Map<string, string> {
  for (const node of nodes) {
    if (node.kind === "file") {
      target.set(node.nodeId, node.materialId);
    } else {
      buildMaterialIdByNodeId(node.children, target);
    }
  }
  return target;
}

function CategoryTree({
  categoryTypes,
  materials,
  onSelectMaterial,
  className,
}: CategoryTreeProps) {
  const tree = useMemo(
    () => buildCatalogTree({ categoryTypes, materials }),
    [categoryTypes, materials],
  );

  const materialIdByNodeId = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of tree.groups) {
      buildMaterialIdByNodeId(group.folders, map);
    }
    return map;
  }, [tree]);

  const [state, setState] = useState<CatalogTreeState>(() =>
    createInitialState(),
  );

  const visibleNodes = useMemo(
    () => getVisibleNodes(tree, state),
    [tree, state],
  );

  const handleToggle = useCallback((nodeId: string) => {
    setState((previous) => toggleNode(previous, nodeId));
  }, []);

  const handleSelectFile = useCallback(
    (nodeId: string) => {
      const materialId = materialIdByNodeId.get(nodeId);
      if (materialId !== undefined) {
        onSelectMaterial(materialId);
      }
    },
    [materialIdByNodeId, onSelectMaterial],
  );

  return (
    <div className={classNames(styles.root, className)} role="tree">
      {visibleNodes.map((node) => {
        const depthClass =
          styles[`depth${Math.min(node.depth, MAX_INDENT_DEPTH)}`];
        const isFolder = node.kind === "folder";

        return (
          <button
            key={node.nodeId}
            type="button"
            role="treeitem"
            aria-level={node.depth + 1}
            aria-expanded={isFolder ? node.expanded : undefined}
            className={classNames(
              styles.node,
              isFolder ? styles.folder : styles.file,
              depthClass,
            )}
            onClick={() =>
              isFolder
                ? handleToggle(node.nodeId)
                : handleSelectFile(node.nodeId)
            }
          >
            <span className={styles.indicator} aria-hidden="true">
              {isFolder
                ? node.hasChildren
                  ? node.expanded
                    ? EXPANDED_INDICATOR
                    : COLLAPSED_INDICATOR
                  : ""
                : FILE_INDICATOR}
            </span>
            <span className={styles.label}>{node.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTree;
