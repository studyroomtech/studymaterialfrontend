// Type declarations for the `useUnlockOptions` API-call hook
// (linked-material-entitlement). All type/interface declarations live here so
// the hook module stays free of type declarations (Req 1.15, 1.17). The shapes
// mirror the Backend `GET /api/materials/:id/unlock-options` response.

/**
 * A purchasable Paid Material offered to unlock a locked material through its
 * Link Group: the paid note's id, title, and Price. The Frontend links the
 * Learner to `/materials/{id}` to complete payment there.
 */
export interface UnlockOption {
  id: string;
  title: string;
  priceAmount: number | null;
  currency: string | null;
}

/**
 * The response body of `GET /api/materials/:id/unlock-options`: the Paid
 * Materials whose purchase unlocks the requested material through its Link
 * Group. An empty `options` array means nothing in the group is purchasable.
 */
export interface UnlockOptionsResult {
  options: UnlockOption[];
}
