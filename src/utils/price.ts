// Pure price utility: paid/free classification and Price/Currency formatting.
//
// These helpers are pure and framework-free so they can be reused across the
// Paid Materials Tab, material cards, and views, and unit-tested without I/O.
// They mirror the Backend Project's price rules; the Backend API remains the
// authority and re-validates every Price.
//
// References:
//   - Req 12.1:  the Paid Materials Tab displays each Paid Material's Price
//     amount and Currency.
//   - Req 11.13: a positive Price amount (1..1,000,000, Currency INR) marks a
//     Study Material as a Paid Material.
//   - Req 11.14: no Price or a Price amount of 0 marks a Study Material Free.

import {
  CURRENCY_LOCALES,
  CURRENCY_SYMBOLS,
  DEFAULT_CURRENCY,
  DEFAULT_PRICE_LOCALE,
  FREE_PRICE_LABEL,
  PRICE_CLASSIFICATION,
} from './price.constant';
import type {
  FormatPriceOptions,
  Price,
  PriceAmount,
  PriceClassification,
} from './price.types';

/**
 * Return true when `amount` is a positive, finite Price amount, i.e. the
 * Study Material is a Paid Material. A `null`/`undefined`/0 (or negative or
 * non-finite) amount is not paid (Req 11.13, 11.14).
 */
export function isPaidAmount(amount: PriceAmount): boolean {
  return typeof amount === 'number' && Number.isFinite(amount) && amount > 0;
}

/** Convenience inverse of {@link isPaidAmount}: true for a Free Material. */
export function isFreeAmount(amount: PriceAmount): boolean {
  return !isPaidAmount(amount);
}

/**
 * Classify a Price amount as `paid` (amount > 0) or `free` (null/undefined/0)
 * (Req 11.13, 11.14).
 */
export function classifyPrice(amount: PriceAmount): PriceClassification {
  return isPaidAmount(amount)
    ? PRICE_CLASSIFICATION.paid
    : PRICE_CLASSIFICATION.free;
}

/** Return true when the given Study Material Price denotes a Paid Material. */
export function isPaidMaterial(price: Price): boolean {
  return isPaidAmount(price.amount);
}

/** Resolve a Currency code, falling back to the platform default (INR). */
export function resolveCurrency(currency?: string): string {
  const trimmed = currency?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : DEFAULT_CURRENCY;
}

/**
 * Return the display symbol for a Currency (e.g. "₹" for INR), or the resolved
 * Currency code when no symbol mapping exists.
 */
export function currencySymbol(currency?: string): string {
  const code = resolveCurrency(currency);
  const symbols: Record<string, string> = CURRENCY_SYMBOLS;
  return symbols[code] ?? code;
}

/** Resolve the BCP 47 locale used to format amounts for a Currency. */
function resolveLocale(currency: string): string {
  const locales: Record<string, string> = CURRENCY_LOCALES;
  return locales[currency] ?? DEFAULT_PRICE_LOCALE;
}

/**
 * Format a numeric amount against a Currency using the currency's numbering
 * system (e.g. "₹1,00,000" for INR). Whole amounts render without fraction
 * digits; fractional amounts render up to two decimal places.
 */
function formatAmount(amount: number, currency: string): string {
  const locale = resolveLocale(currency);
  const hasFraction = !Number.isInteger(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fall back to a symbol + grouped-number rendering when the runtime does
    // not recognize the Currency code for the `currency` number style.
    const grouped = new Intl.NumberFormat(locale, {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${currencySymbol(currency)}${grouped}`;
  }
}

/**
 * Format a Price amount with its Currency for display (Req 12.1). A Free
 * Material (null/undefined/0 amount) renders as the free label by default;
 * pass `freeAsLabel: false` to format a 0 amount as a currency value instead.
 */
export function formatPrice(
  amount: PriceAmount,
  options: FormatPriceOptions = {},
): string {
  const { currency, freeAsLabel = true } = options;
  const resolved = resolveCurrency(currency);

  if (isFreeAmount(amount)) {
    return freeAsLabel ? FREE_PRICE_LABEL : formatAmount(0, resolved);
  }

  return formatAmount(amount as number, resolved);
}

/**
 * Format a whole {@link Price} (amount + Currency) for display, honoring the
 * Price's own Currency and falling back to the platform default (Req 12.1).
 */
export function formatPriceValue(
  price: Price,
  options: Omit<FormatPriceOptions, 'currency'> = {},
): string {
  return formatPrice(price.amount, { ...options, currency: price.currency });
}
