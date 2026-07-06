// Constant values for the CategoryTree component (Requirements 1.16, 1.17).

/**
 * Highest indentation depth that has a dedicated depth class in the module
 * stylesheet. Deeper nodes are clamped to this depth so indentation degrades
 * gracefully rather than requiring an unbounded set of classes (or inline CSS,
 * which is forbidden by Req 1.19).
 */
export const MAX_INDENT_DEPTH = 8;

/** Indicator shown on an expanded Folder Node (Req 3.4). */
export const EXPANDED_INDICATOR = "\u25BE"; // ▾

/** Indicator shown on a collapsed Folder Node (Req 3.3). */
export const COLLAPSED_INDICATOR = "\u25B8"; // ▸

/** Indicator shown on a leaf File Node (Req 3.5). */
export const FILE_INDICATOR = "\u2022"; // •
