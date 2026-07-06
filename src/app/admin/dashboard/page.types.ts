// Type declarations for the admin dashboard page (Requirements 1.15, 1.17).
//
// The dashboard reads the Material Catalog for display and drives Content
// Management Actions through the `useAdminMaterials` hook. These view types
// model the catalog data the page renders, including the optional Price
// (amount + Currency) an Admin may set on upload/edit (Req 11.13–11.16).

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
