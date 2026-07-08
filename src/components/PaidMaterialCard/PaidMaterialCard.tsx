"use client";

// PaidMaterialCard component (Requirements 12.1, 12.3).
//
// Renders a single Paid Material for the Paid Materials Tab: its title, an
// optional description, its Price (amount + Currency) formatted via the shared
// price utility (Req 12.1), and an entitlement-aware action. When the Learner
// does not yet hold a Payment Entitlement the card shows a "Buy" action; once
// entitled it shows a "View/Download" action (Req 12.3). Entitlement and the
// action callbacks are supplied by the parent (props-driven) so the card stays
// presentational and reusable.
//
// All styling lives in `PaidMaterialCard.module.scss` (no inline CSS) and
// consumes the shared theme (Req 1.18, 1.19, 7.5). The Button component is
// reused for the action.

import Button from "../Button/Button";
import { formatPrice } from "../../utils/price";
import styles from "./PaidMaterialCard.module.scss";
import {
  ADD_TO_CART_LABEL,
  BUY_ACTION_LABEL,
  IN_CART_LABEL,
  PRICE_LABEL_PREFIX,
  VIEW_ACTION_LABEL,
} from "./PaidMaterialCard.constant";
import type { PaidMaterialCardProps } from "./PaidMaterialCard.types";

/**
 * Join a set of class names, dropping any falsy entries.
 * @param names candidate class names (falsy values are ignored).
 * @returns a space-separated className string.
 */
function classNames(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function PaidMaterialCard({
  materialId,
  title,
  description,
  priceAmount,
  currency,
  isEntitled,
  onBuy,
  onView,
  isBusy = false,
  onAddToCart,
  isInCart = false,
  className,
}: PaidMaterialCardProps) {
  // Format the Price against its Currency; a paid amount always renders as a
  // currency value rather than the free label (Req 12.1).
  const formattedPrice = formatPrice(priceAmount, {
    currency,
    freeAsLabel: false,
  });

  // Choose the action label based on the Learner's entitlement (Req 12.3).
  const actionLabel = isEntitled ? VIEW_ACTION_LABEL : BUY_ACTION_LABEL;

  const handleAction = () => {
    if (isEntitled) {
      onView(materialId);
    } else {
      onBuy(materialId);
    }
  };

  return (
    <article className={classNames(styles.card, className)}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.footer}>
        <p className={styles.price}>
          <span className={styles.priceLabel}>{PRICE_LABEL_PREFIX}</span>
          <span className={styles.priceValue}>{formattedPrice}</span>
        </p>
        <div className={styles.actions}>
          {!isEntitled && onAddToCart ? (
            <Button
              variant="secondary"
              onClick={() => onAddToCart(materialId)}
              disabled={isInCart || isBusy}
            >
              {isInCart ? IN_CART_LABEL : ADD_TO_CART_LABEL}
            </Button>
          ) : null}
          <Button
            variant={isEntitled ? "secondary" : "primary"}
            onClick={handleAction}
            isLoading={isBusy}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default PaidMaterialCard;
