// Types for the pure price utility (`price.ts`).
//
// All type/interface declarations for the price helpers live here so the
// utility module itself stays free of type declarations (Requirements 1.15,
// 1.17). These model a Study Material's Price (amount + Currency) and its
// paid/free classification, used to render the Paid Materials Tab (Req 12.1)
// and to distinguish Paid from Free Materials (Req 11.13, 11.14).

/**
 * A Study Material's Price classification: `paid` when it carries a positive
 * Price amount, `free` when it has no Price or a Price amount of 0
 * (Req 11.13, 11.14).
 */
export type PriceClassification = 'paid' | 'free';

/**
 * A Price amount as carried on a Study Material. `null` (or a value of 0)
 * denotes a Free Material; a positive integer denotes a Paid Material's charge
 * in the whole units of its Currency (Req 11.13, 11.14).
 */
export type PriceAmount = number | null | undefined;

/**
 * A Study Material's Price: an `amount` in the whole units of `currency`. When
 * `amount` is `null`/`undefined`/0 the material is Free; the Currency defaults
 * to INR (Req 12.1, Req 11.13, Req 11.14).
 */
export interface Price {
  amount: PriceAmount;
  currency?: string;
}

/** Options controlling how a Price is rendered by the formatting helpers. */
export interface FormatPriceOptions {
  /** The Currency code to format against; defaults to the platform default. */
  currency?: string;
  /**
   * When true (the default), a Free Material is rendered as the free label
   * instead of a zero amount; when false, a zero amount is formatted normally.
   */
  freeAsLabel?: boolean;
}
