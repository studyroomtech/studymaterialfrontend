// Type declarations for the PaidMaterialCard component (Requirements 1.15, 12.1, 12.3).
//
// The PaidMaterialCard renders a single Paid Material's title and Price
// (amount + Currency) and exposes an entitlement-aware action: "Buy" when the
// Learner is not yet entitled, or "View/Download" once a Payment Entitlement
// exists (Req 12.1, 12.3). All type/interface declarations for the component
// live here so the component module stays free of type declarations
// (Req 1.15, 1.17).

/**
 * Props for the PaidMaterialCard.
 *
 * The card is entitlement-aware and driven entirely by props: the parent
 * supplies whether the Learner holds a Payment Entitlement for the material
 * (`isEntitled`) and the callbacks to run for each action. When not entitled
 * the card presents a Buy action (`onBuy`); once entitled it presents a
 * View/Download action (`onView`) (Req 12.3).
 */
export interface PaidMaterialCardProps {
  /** Stable identifier of the Paid Material, forwarded to the action callback. */
  materialId: string;
  /** The Paid Material's title, rendered as the card heading (Req 12.1). */
  title: string;
  /** Optional short description shown beneath the title. */
  description?: string;
  /**
   * The Paid Material's Price amount in the whole units of `currency`
   * (Req 12.1). A `null`/`undefined`/0 amount is treated as Free by the price
   * utility, though this card is intended for Paid Materials.
   */
  priceAmount: number | null | undefined;
  /**
   * The Currency of the Price; defaults to the platform default (INR) when
   * omitted (Req 12.1).
   */
  currency?: string;
  /**
   * Whether the Learner holds a Payment Entitlement for this material. When
   * true the card shows the View/Download action; when false it shows the Buy
   * action (Req 12.3).
   */
  isEntitled: boolean;
  /**
   * Called with the material id when the Learner triggers the Buy action
   * (shown only when `isEntitled` is false).
   */
  onBuy: (materialId: string) => void;
  /**
   * Called with the material id when the Learner triggers the View/Download
   * action (shown only when `isEntitled` is true).
   */
  onView: (materialId: string) => void;
  /**
   * When true, the action is shown in a loading/blocked state (e.g. while a
   * Payment is being initiated or content is being fetched).
   */
  isBusy?: boolean;
  /**
   * Called with the material id to add it to the cart. When provided (and the
   * Learner is not yet entitled) the card renders an "Add to cart" action
   * alongside Buy.
   */
  onAddToCart?: (materialId: string) => void;
  /** Whether this material is already in the cart (drives the add-to-cart label). */
  isInCart?: boolean;
  /** Optional additional class name applied to the card root element. */
  className?: string;
}
