// Type declarations for the StudyMaterialTab component (Requirements 1.15, 1.17).
//
// The Study Material Tab reads the Material Catalog for display and drives
// Content Management Actions through the `useAdminMaterials` hook. These view
// types model the catalog data the tab renders, including the optional Price
// (amount + Currency) an Admin may set on upload/edit (Req 11.13–11.16).

import type { AdminMaterialFile } from '@/hooks/api/useAdminMaterials.types';
import type { CatalogCategoryType, CatalogTag } from '@/utils/catalogTree.types';

/**
 * A Study Material as rendered by the dashboard. Includes the optional
 * `description` (which the public catalog tree view omits) so it can be
 * pre-filled when editing title/description (Req 11.5). The optional
 * `priceAmount`/`currency` reflect the stored Price so the edit form can be
 * pre-filled: `null`/`0` denotes a Free Material, a positive amount a Paid
 * Material (Req 11.13, 11.14).
 */
export interface DashboardMaterial {
  id: string;
  title: string;
  description?: string;
  tagsByCategoryType: Record<string, CatalogTag[]>;
  /** The Price amount for a Paid Material, or `null`/`0` when Free. */
  priceAmount?: number | null;
  /** The Currency of the Price (INR), or `null`/absent when Free. */
  currency?: string | null;
  /** The Link Group id this material belongs to, or `null`/absent when ungrouped. */
  linkGroupId?: string | null;
  /**
   * Every file (PDF) attached to the material, ordered primary-first. The
   * public catalog (`GET /api/catalog`) omits this, so the edit view loads it
   * on demand from `GET /api/materials/:id` when editing (Req 11.1).
   */
  files?: AdminMaterialFile[];
}

/** The catalog structure the dashboard loads from `GET /api/catalog`. */
export interface DashboardCatalog {
  categoryTypes: CatalogCategoryType[];
  materials: DashboardMaterial[];
}

/** A transient feedback banner shown after a Content Management Action. */
export interface DashboardFeedback {
  kind: 'success' | 'error';
  message: string;
}

/**
 * The draft values held while editing a material's title, description, and
 * Price. `price` is the raw amount string entered in the Price field; an empty
 * string or `0` marks the material Free, a positive value marks it Paid
 * (Req 11.13, 11.14).
 */
export interface MaterialEditDraft {
  title: string;
  description: string;
  price: string;
}

/** Identifies the Category Type or Category currently being renamed. */
export interface RenameTarget {
  kind: 'categoryType' | 'category';
  id: string;
}

/**
 * Props for a single pick-or-create classification picker on the upload form
 * (used identically for Categories, Subjects, and Jobs). Existing values are
 * shown as toggle chips; a text field adds a new name that will be auto-created
 * on upload (Req 0.1, 2.2).
 */
export interface CategoryPickerProps {
  /** Group label (for example, "Categories", "Subjects", "Jobs"). */
  label: string;
  /** Supporting hint describing the pick-or-create behavior. */
  hint: string;
  /** Unique id for the "add new" text input. */
  inputId: string;
  /** Placeholder for the "add new" text input. */
  placeholder: string;
  /** Text shown when there are no existing values to choose from. */
  emptyText: string;
  /** The existing value names available to toggle. */
  existingNames: string[];
  /** The currently selected value names. */
  selected: string[];
  /** Replace the selected value names. */
  onSelectedChange: (next: string[]) => void;
  /** The current "add new" text-input value. */
  inputValue: string;
  /** Update the "add new" text-input value. */
  onInputChange: (value: string) => void;
  /** Whether the picker controls are disabled (an action is in flight). */
  disabled: boolean;
}

/**
 * The outcome of parsing the raw Price-field input. `amount` is `null` for a
 * Free Material (empty or 0) and a positive integer for a Paid Material; the
 * Backend API re-validates every Price (Req 11.13–11.15).
 */
export type ParsedPrice =
  | { ok: true; amount: number | null }
  | { ok: false };

/** A minimal id/title pair (plus its group) used to render and pick materials. */
export interface MaterialOption {
  id: string;
  title: string;
  /** The Link Group id this material belongs to, or `null`/absent when ungrouped. */
  linkGroupId?: string | null;
}

/**
 * A single choosable link target in a dropdown. Already-grouped materials
 * collapse into one target representing the whole group; picking it links to
 * every member at once (the Backend merges groups). `value` is a representative
 * member id sent to the link API; `memberIds` is the full membership used to
 * exclude a group the subject is already part of.
 */
export interface LinkTargetOption {
  value: string;
  label: string;
  memberIds: string[];
}

/**
 * Props for the inline multi-select material picker used on the upload form to
 * choose existing materials to link the new upload with (Req 1.1–1.4).
 */
export interface MaterialMultiPickerProps {
  /** Group label. */
  label: string;
  /** Supporting hint. */
  hint: string;
  /** Placeholder text for the empty select option. */
  placeholderOption: string;
  /** Text shown when there are no options to choose from. */
  emptyText: string;
  /** All selectable materials (grouped materials are collapsed into one entry). */
  options: MaterialOption[];
  /** Currently selected representative ids (one per chosen material or group). */
  selectedIds: string[];
  /** Replace the selected representative ids. */
  onSelectedChange: (next: string[]) => void;
  /** Whether the controls are disabled (an action is in flight). */
  disabled: boolean;
}

/**
 * Props for the inline Link Group editor rendered while editing a material. It
 * reads the material's current Siblings, lets the Admin link it with other
 * materials (merging groups), and remove it from its group
 * (linked-material-entitlement Req 2.1–2.8).
 */
export interface LinkGroupEditorProps {
  /** The material being edited (the Link Group subject). */
  materialId: string;
  /** All other materials (excludes the subject); grouped ones collapse into one target. */
  otherMaterials: MaterialOption[];
  /** Whether the controls are disabled (another action is in flight). */
  disabled: boolean;
  /** Read the subject's current Sibling ids. */
  onLoadSiblings: (materialId: string) => Promise<string[] | null>;
  /** Link the subject with the given material ids; resolves to whether it changed. */
  onLink: (materialId: string, materialIds: string[]) => Promise<boolean | null>;
  /** Remove the subject from its group; resolves to whether it changed. */
  onUnlink: (materialId: string) => Promise<boolean | null>;
}

/**
 * Props for the inline files editor rendered while editing a material. It loads
 * the material's current files on mount (from `GET /api/materials/:id`, since
 * the catalog omits files), lists them with a Remove action, and offers a
 * multi-file input to add more (Req 11.1, 11.3). All storage/ordering logic
 * lives in the Backend; this control only calls the endpoints and reflects the
 * returned file list.
 */
export interface MaterialFilesEditorProps {
  /** The material whose files are being managed. */
  materialId: string;
  /** The learner/admin Access Token used to fetch the current file list. */
  authToken: string | null;
  /** Whether the controls are disabled (another action is in flight). */
  disabled: boolean;
  /**
   * Add the chosen files to the material; resolves to whether it succeeded so
   * the editor can reload its file list.
   */
  onAddFiles: (materialId: string, files: File[]) => Promise<boolean>;
  /**
   * Remove a single file from the material; resolves to whether it succeeded so
   * the editor can reload its file list.
   */
  onRemoveFile: (materialId: string, fileId: string) => Promise<boolean>;
}
