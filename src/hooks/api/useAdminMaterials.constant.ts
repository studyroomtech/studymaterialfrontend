// Constants for the admin content-management hook (`useAdminMaterials.ts`).
//
// Centralizes the admin Backend API route paths and the browser storage key for
// the admin session token so the hook has a single source of truth. The Backend
// API base URL itself is read at call time from `NEXT_PUBLIC_API_BASE_URL`
// (see `apiClient.ts`) rather than hardcoded here.
//
// Scope: material CRUD (title/description/file, optional Price), tag
// assignment, and Category Type / Category management. The optional Price
// (amount + Currency) is sent on upload/edit (Req 11.13, 11.5); the Backend API
// remains the authority and re-validates every Price (Req 11.15).

// Admin Backend API route paths (relative to the configured API base URL).
//   - `login`         -> POST   /api/admin/login                          (Req 10.5)
//   - `materials`     -> POST   /api/admin/materials                      (Req 11.1)
//                        PATCH  /api/admin/materials/:id                  (Req 11.5)
//                        DELETE /api/admin/materials/:id                  (Req 11.3)
//   - `categoryTypes` -> POST/PATCH/DELETE /api/admin/category-types[/:id] (Req 11.7)
//   - `categories`    -> POST/PATCH/DELETE /api/admin/categories[/:id]     (Req 11.7)
export const ADMIN_API_ROUTES = {
  login: '/api/admin/login',
  materials: '/api/admin/materials',
  categoryTypes: '/api/admin/category-types',
  categories: '/api/admin/categories',
  // `reviews` -> DELETE /api/admin/reviews/:reviewId  (admin review moderation)
  reviews: '/api/admin/reviews',
} as const;

/** Path segment appended to a material route for its Tag assignments (Req 2.2, 2.3). */
export const ADMIN_MATERIAL_TAGS_SEGMENT = 'tags';

/**
 * Path segment appended to a material route for its Link Group management:
 * `GET/POST/DELETE /api/admin/materials/:id/link-group`. A GET reads the
 * material's current Siblings, a POST links/merges it with other materials, and
 * a DELETE removes it from its Link Group (linked-material-entitlement feature).
 */
export const ADMIN_MATERIAL_LINK_GROUP_SEGMENT = 'link-group';

/**
 * Browser `localStorage` key under which the Admin's role_admin JWT is
 * persisted so content-management calls can reuse the session without
 * re-authenticating on every action (Req 10.5).
 */
export const ADMIN_TOKEN_STORAGE_KEY = 'sm.admin.adminToken';

// Multipart form-field names used when uploading a Study Material (Req 11.1).
// `priceAmount` and `currency` carry the optional Price on upload (Req 11.13);
// they are only appended to the form when a Price is provided so a plain upload
// stays Free (Req 11.14).
// `categories` carries the selected/typed Category names as a JSON-encoded
// string array; the Backend parses it and resolves/auto-creates each Category.
// `linkedMaterialIds` carries the ids of existing materials to link the new
// upload with, as a JSON-encoded string array; only appended when at least one
// is chosen so a plain upload creates an ungrouped material
// (linked-material-entitlement Req 1.1–1.4).
export const ADMIN_MATERIAL_FORM_FIELDS = {
  title: 'title',
  description: 'description',
  file: 'file',
  priceAmount: 'priceAmount',
  currency: 'currency',
  categories: 'categories',
  subjects: 'subjects',
  jobs: 'jobs',
  linkedMaterialIds: 'linkedMaterialIds',
} as const;
