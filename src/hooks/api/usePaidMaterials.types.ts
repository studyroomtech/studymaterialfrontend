// Type declarations for the `usePaidMaterials` API-call hook (Req 12.1).
//
// The hook lists Paid Materials for the Paid Materials Tab, each with its Price
// amount and Currency. All type/interface declarations live here so the hook
// module stays free of type declarations (Req 1.15, 1.17). The DTO shapes
// mirror the Backend API's `GET /api/materials/paid` response documented in the
// design.

import type { MaterialTag } from './apiHooks.types';

/**
 * A single Paid Material as returned by `GET /api/materials/paid` (Req 12.1).
 * The listing never includes file bytes or presigned URLs — content access
 * remains gated by a Payment Entitlement (Req 12.3).
 */
export interface PaidMaterial {
  /** Stable identifier of the Paid Material. */
  id: string;
  /** The Paid Material's title (Req 12.1). */
  title: string;
  /** Optional short description shown alongside the title. */
  description?: string;
  /**
   * The Price amount in the whole units of {@link currency}. Always positive
   * for a Paid Material (Req 11.13); the listing only surfaces Paid Materials.
   */
  priceAmount: number | null;
  /** The Currency of the Price (defaults to INR — Req 12.1). */
  currency: string | null;
  /** Always `true` for entries in the Paid Materials listing (Req 12.1). */
  isPaid: boolean;
  /**
   * Optional Tags grouped by Category Type, when the Backend API includes them
   * for filtering/display within the Paid Materials Tab.
   */
  tagsByCategoryType?: Record<string, MaterialTag[]>;
}

/**
 * The response body of `GET /api/materials/paid`: the available Paid Materials
 * together with their Prices (Req 12.1). An empty `materials` array signals
 * that no Paid Materials are available for the caller to render.
 */
export interface PaidMaterialsResult {
  materials: PaidMaterial[];
}
