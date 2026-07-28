// Shared types for the API-call hooks in the Hooks Folder (`hooks/api/`).
//
// All type/interface declarations for `useApiResource`, `useCatalog`,
// `useSearchMaterials`, and `useMaterial` live here so the hook modules stay
// free of type declarations (Req 1.15, 1.17). The DTO shapes mirror the Backend
// API responses documented in the design.

import type { CatalogInput } from '@/utils/catalogTree.types';
import type { HttpError } from '@/utils/http.types';

/**
 * The common async state returned by every API-call hook (Req 7.3, 8.1):
 *   - `data`      the last successfully loaded value, or `null` before the
 *                 first success. It is intentionally NOT cleared on a later
 *                 failure so the caller can preserve the current view
 *                 (Req 3.9, 8.1).
 *   - `isLoading` `true` while a request is in flight, driving loading
 *                 indicators (Req 7.3, 5.2).
 *   - `error`     the typed failure of the most recent request, or `null`
 *                 when the last request succeeded or none has failed
 *                 (Req 8.1, 8.2).
 */
export interface AsyncState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: HttpError | null;
}

/** Options accepted by the internal `useApiResource` hook. */
export interface UseApiResourceOptions {
  /** Overrides the shared 30s request timeout enforced by `utils/http.ts`. */
  timeoutMs?: number;
  /**
   * When provided, sent as an `Authorization: Bearer <token>` header so the
   * Backend API can resolve the learner (e.g. to evaluate the Paid-Material
   * entitlement gate on `GET /api/materials/:id`). A change in the token
   * re-fetches the resource.
   */
  authToken?: string | null;
}

/** The Material Catalog structure returned by `GET /api/catalog` (Req 3.1, 2.5). */
export type CatalogData = CatalogInput;

/** A single Tag (Category reference) assigned to a Study Material. */
export interface MaterialTag {
  categoryId: string;
  name: string;
}

/**
 * A Study Material as returned by the search endpoint. `tagsByCategoryType` is
 * keyed by `categoryTypeId`; each value lists the Tags under that Category Type.
 */
export interface SearchMaterial {
  id: string;
  title: string;
  description?: string;
  tagsByCategoryType: Record<string, MaterialTag[]>;
  /** The material's average rating, or `null` when it has no ratings yet. */
  averageRating?: number | null;
  /** The number of ratings the material has received (0 when none). */
  reviewCount?: number;
}

/**
 * The response body of `GET /api/materials/search`: the matching materials and
 * the number matched. An empty `materials` array signals "no matching
 * materials" for the caller to render (Req 4.5).
 */
export interface SearchMaterialsResult {
  materials: SearchMaterial[];
  matched: number;
}

/** Parameters accepted by {@link useSearchMaterials} (Req 4.1, 4.2, 4.4). */
export interface UseSearchMaterialsParams {
  /** The search query; empty/whitespace returns all materials (Req 4.3). */
  query: string;
  /** Optional Category filter; restricts results to that Category (Req 4.2). */
  categoryId?: string;
}

/**
 * Complete metadata for one Study Material as returned by
 * `GET /api/materials/:id` (Req 5.1, 5.3). The Object Storage Key is never
 * exposed to the Frontend Project.
 */
export interface MaterialDetail {
  id: string;
  title: string;
  description: string;
  tagsByCategoryType: Record<string, MaterialTag[]>;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  /** The price amount for a Paid Material, or `null` for a Free Material. */
  priceAmount: number | null;
  /** The currency for a Paid Material's price, or `null` when free. */
  currency: string | null;
  /** `true` when the material is a Paid Material requiring an entitlement. */
  isPaid: boolean;
  /** The material's average rating, or `null` when it has no ratings yet. */
  averageRating?: number | null;
  /** The number of ratings the material has received (0 when none). */
  reviewCount?: number;
}

/**
 * A single review as returned by `GET /api/materials/:id/reviews`. The reviewer
 * is identified by display name only; the email is never exposed. `isOwn` marks
 * the signed-in caller's own review so the UI can offer edit/delete.
 */
export interface MaterialReview {
  id: string;
  reviewerName: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  isOwn: boolean;
}

/**
 * The reviews payload for a Study Material: the list plus the aggregate,
 * whether the caller may submit a review, and the caller's own review (for
 * prefill), as returned by `GET /api/materials/:id/reviews`.
 */
export interface MaterialReviewsResult {
  reviews: MaterialReview[];
  averageRating: number | null;
  reviewCount: number;
  canReview: boolean;
  myReview: MaterialReview | null;
}
