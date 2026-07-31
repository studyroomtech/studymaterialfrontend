// Type declarations for the admin content-management hook
// (`useAdminMaterials.ts`). All type/interface declarations live here so the
// hook module stays free of type declarations (Req 1.15, 1.17).
//
// The DTO shapes mirror the admin Backend API responses documented in the
// design. Price fields (amount + Currency) are sent on upload/edit and
// reflected on the returned material in Phase 2 (Req 11.13, 11.5); when a
// caller omits them the material is treated as Free, preserving Phase 1
// behavior (Req 11.14).

import type { HttpError, HttpResult } from '@/utils/http.types';

/** A single Tag (Category reference) assigned to a Study Material (Req 2.3). */
export interface AdminMaterialTag {
  categoryId: string;
  name: string;
}

/**
 * A Study Material's metadata as returned by the admin material endpoints
 * (Req 11.1, 11.5). The Object Storage Key is never exposed to the Frontend
 * Project. The Price fields reflect the stored Price: `priceAmount` is the
 * amount in the smallest Currency unit (paise) — `null`/`0` denotes a Free
 * Material and a positive amount denotes a Paid Material — with `currency`
 * (INR) and the derived `isPaid` flag (Req 11.13, 11.14).
 */
export interface AdminMaterial {
  id: string;
  title: string;
  description: string;
  tagsByCategoryType: Record<string, AdminMaterialTag[]>;
  fileName?: string;
  contentType?: string;
  fileSizeBytes?: number;
  /** The Price amount (paise) for a Paid Material, or `null`/`0` when Free. */
  priceAmount?: number | null;
  /** The Currency of the Price (INR), or `null` when Free. */
  currency?: string | null;
  /** `true` when the material is a Paid Material (`priceAmount > 0`). */
  isPaid?: boolean;
}

/**
 * A Category within a Category Type — a named classification value such as
 * "Mathematics" under Subject (Req 2.1, 11.7).
 */
export interface AdminCategory {
  id: string;
  name: string;
  categoryTypeId: string;
}

/**
 * A Category Type — a classification dimension (for example, Subject or Job)
 * together with the Categories defined within it (Req 2.1, 11.7).
 */
export interface AdminCategoryType {
  id: string;
  name: string;
  categories: AdminCategory[];
}

/**
 * Fields for uploading a new Study Material via multipart form data
 * (Req 11.1). Accepts a title, optional description, and the file. An optional
 * `priceAmount` (paise, `1..1000000`) with `currency` INR marks the material as
 * a Paid Material (Req 11.13); when the Price fields are omitted (or the amount
 * is `null`/`0`) the material is uploaded as Free (Req 11.14).
 */
export interface CreateMaterialInput {
  title: string;
  description?: string;
  file: File;
  /** Price amount in paise (`1..1000000`) for a Paid Material; omit for Free. */
  priceAmount?: number | null;
  /** Currency of the Price (INR); defaults server-side when omitted. */
  currency?: string;
  /**
   * A flat list of Category names to attach to the new material. Existing
   * Categories are reused by name; a name that does not match any existing
   * Category is auto-created server-side. Omit or pass an empty array for none.
   */
  categories?: string[];
  /**
   * Subject names to attach; resolved/created under the Subject Category Type
   * (same pick-or-create behavior as {@link categories}).
   */
  subjects?: string[];
  /**
   * Job names to attach; resolved/created under the Job Category Type (same
   * pick-or-create behavior as {@link categories}).
   */
  jobs?: string[];
  /**
   * Ids of existing materials to link the new upload with, forming (or merging
   * into) a single Link Group so buying any member unlocks all members. Omit or
   * pass an empty array to create an ungrouped material
   * (linked-material-entitlement Req 1.1–1.4).
   */
  linkedMaterialIds?: string[];
}

/**
 * Fields for editing a Study Material's title, description, and/or Price
 * (Req 11.5, 11.6, 11.13). Omitted fields are left unchanged. Sending
 * `priceAmount` (paise, `1..1000000`) with `currency` INR sets a Paid Price;
 * sending `priceAmount: null`/`0` clears it back to a Free Material (Req 11.14).
 */
export interface UpdateMaterialInput {
  title?: string;
  description?: string;
  /** New Price amount in paise; `null`/`0` clears the Price (Free). */
  priceAmount?: number | null;
  /** Currency of the Price (INR). */
  currency?: string;
}

/** Fields for adding a Category under an existing Category Type (Req 11.7). */
export interface CreateCategoryInput {
  name: string;
  categoryTypeId: string;
}

/**
 * The response of `GET /api/admin/materials/:id/link-group` — the ids of the
 * material's Siblings (the other members of its Link Group), excluding the
 * material itself; empty when the material belongs to no Link Group
 * (linked-material-entitlement Req 2.7, 2.8).
 */
export interface LinkGroupResponse {
  siblingIds: string[];
}

/**
 * The response of the link (`POST`) and unlink (`DELETE`) Link Group mutations —
 * the subject's Sibling ids after the operation together with whether the
 * operation changed any membership (`changed: false` for an idempotent no-op:
 * linking materials already grouped together, or unlinking an ungrouped
 * material).
 */
export interface LinkGroupMutationResponse {
  siblingIds: string[];
  changed: boolean;
}

/**
 * The typed result of an admin mutation: either success with the parsed
 * response body, or a typed {@link HttpError} the caller can surface while the
 * hook also records it in its `error` state (Req 8.1).
 */
export type AdminMutationResult<TData> = HttpResult<TData>;

/**
 * Value returned by {@link useAdminMaterials}. Authorization is derived from the
 * account (learner) Access Token whose `roles` include `role_admin` — there is
 * no separate admin login. Exposes the admin flag, shared loading/error state
 * for the most recent Content Management Action, and the material/category
 * management operations (Req 10.4, 11.1, 11.3, 11.5, 11.7). Every management
 * call sends the account Bearer token; when the signed-in user is not an admin
 * it resolves to an authorization error without contacting the Backend API.
 */
export interface UseAdminMaterialsResult {
  /** `true` when the signed-in user's token holds `role_admin` (Req 10.4). */
  isAdmin: boolean;
  /** `true` while a Content Management Action request is in flight. */
  isLoading: boolean;
  /** The typed failure of the most recent action, or `null` on success/idle. */
  error: HttpError | null;

  /** Sign out entirely by discarding the account Access Token. */
  logout: () => void;

  /** Upload a new Study Material (multipart), optionally with a Price (Req 11.1, 11.13). */
  createMaterial: (input: CreateMaterialInput) => Promise<AdminMutationResult<AdminMaterial>>;
  /** Edit a Study Material's title, description, and/or Price (Req 11.5, 11.13). */
  updateMaterial: (
    materialId: string,
    input: UpdateMaterialInput,
  ) => Promise<AdminMutationResult<AdminMaterial>>;
  /** Delete a Study Material (Req 11.3). */
  deleteMaterial: (materialId: string) => Promise<AdminMutationResult<void>>;

  /** Assign a Tag (Category) to a Study Material (Req 2.2, 2.3). */
  assignTag: (
    materialId: string,
    categoryId: string,
  ) => Promise<AdminMutationResult<AdminMaterial>>;
  /** Remove a Tag (Category) from a Study Material (Req 2.2). */
  removeTag: (
    materialId: string,
    categoryId: string,
  ) => Promise<AdminMutationResult<void>>;

  /** Add a Category Type (name 1–100, unique) (Req 11.7). */
  createCategoryType: (name: string) => Promise<AdminMutationResult<AdminCategoryType>>;
  /** Rename a Category Type (Req 11.7). */
  renameCategoryType: (
    categoryTypeId: string,
    name: string,
  ) => Promise<AdminMutationResult<AdminCategoryType>>;
  /** Delete a Category Type (Req 11.7). */
  deleteCategoryType: (categoryTypeId: string) => Promise<AdminMutationResult<void>>;

  /** Add a Category under an existing Category Type (Req 11.7). */
  createCategory: (input: CreateCategoryInput) => Promise<AdminMutationResult<AdminCategory>>;
  /** Rename a Category (Req 11.7). */
  renameCategory: (
    categoryId: string,
    name: string,
  ) => Promise<AdminMutationResult<AdminCategory>>;
  /** Delete a Category (Req 11.7). */
  deleteCategory: (categoryId: string) => Promise<AdminMutationResult<void>>;

  /**
   * Read the current Sibling ids of a Study Material's Link Group
   * (linked-material-entitlement Req 2.7, 2.8).
   */
  getLinkGroup: (
    materialId: string,
  ) => Promise<AdminMutationResult<LinkGroupResponse>>;
  /**
   * Link a Study Material with one or more other materials, merging their Link
   * Groups into one so a purchase of any member unlocks all members
   * (linked-material-entitlement Req 2.1, 2.2).
   */
  linkMaterials: (
    materialId: string,
    materialIds: string[],
  ) => Promise<AdminMutationResult<LinkGroupMutationResponse>>;
  /**
   * Remove a Study Material from its Link Group; the group dissolves when fewer
   * than two members remain. A success no-op when the material is already
   * ungrouped (linked-material-entitlement Req 2.4, 2.5, 2.6).
   */
  unlinkMaterial: (
    materialId: string,
  ) => Promise<AdminMutationResult<LinkGroupMutationResponse>>;
}
