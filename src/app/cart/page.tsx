// Cart page — review selected Paid Materials and check out together.
//
// The cart is client-side (`useCart`, localStorage). Checkout hands every item
// id to `usePayment.startCheckout`, which creates ONE Razorpay order for the
// whole cart (Free / already-entitled items are dropped server-side), then
// verifies server-side before granting entitlements (Req 12.4–12.7). On success
// the cart is cleared. Learner identification (Download Gate) and Razorpay
// Checkout are surfaced via the shared modals. All styling lives in
// `page.module.scss` (no inline CSS).

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import Button from "@/components/Button/Button";
import DownloadGateModal from "@/components/DownloadGateModal/DownloadGateModal";
import EmptyState from "@/components/EmptyState/EmptyState";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import PaymentModal from "@/components/PaymentModal/PaymentModal";
import { usePayment } from "@/hooks/api/usePayment";
import { PAYMENT_PHASE } from "@/hooks/api/usePayment.constant";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/price";
import { DEFAULT_CURRENCY } from "@/utils/price.constant";

import styles from "./page.module.scss";
import {
  BROWSE_PAID_HREF,
  BROWSE_PAID_LABEL,
  CART_EMPTY_MESSAGE,
  CART_EMPTY_TITLE,
  CART_ITEMS_LABEL,
  CART_PAGE_SUBTITLE,
  CART_PAGE_TITLE,
  CHECKOUT_LABEL,
  CHECKOUT_SUCCESS_MESSAGE,
  CLEAR_CART_LABEL,
  PAYMENT_FAILED_FALLBACK,
  PAYMENT_FAILED_TITLE,
  REMOVE_LABEL,
  TOTAL_LABEL,
} from "./page.constant";

function CartPage() {
  const cart = useCart();
  const payment = usePayment();
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const { isEntitled, reset } = payment;
  const { clear } = cart;

  // On a verified payment: clear the cart, show success, and reset the flow.
  useEffect(() => {
    if (isEntitled) {
      clear();
      setShowSuccess(true);
      reset();
    }
  }, [isEntitled, clear, reset]);

  const handleCheckout = useCallback(() => {
    setShowSuccess(false);
    payment.startCheckout(cart.items.map((item) => item.id));
  }, [payment, cart.items]);

  const isBusy = payment.isInitiating || payment.isVerifying;
  const showPaymentFailure =
    payment.phase === PAYMENT_PHASE.failed &&
    payment.failureMessage !== undefined;

  const hasItems = cart.hasMounted && cart.items.length > 0;
  const isEmpty = cart.hasMounted && cart.items.length === 0;

  const formattedTotal = formatPrice(cart.totalAmount, {
    currency: DEFAULT_CURRENCY,
    freeAsLabel: false,
  });

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{CART_PAGE_TITLE}</h1>
        <p className={styles.subtitle}>{CART_PAGE_SUBTITLE}</p>
      </header>

      {showSuccess ? (
        <p className={styles.successBanner} role="status">
          {CHECKOUT_SUCCESS_MESSAGE}
        </p>
      ) : null}

      {showPaymentFailure ? (
        <ErrorMessage
          title={PAYMENT_FAILED_TITLE}
          message={payment.failureMessage ?? PAYMENT_FAILED_FALLBACK}
          onRetry={payment.reset}
        />
      ) : null}

      {isEmpty && !showSuccess ? (
        <>
          <EmptyState title={CART_EMPTY_TITLE} message={CART_EMPTY_MESSAGE} />
          <Link href={BROWSE_PAID_HREF} className={styles.subtitle}>
            {BROWSE_PAID_LABEL}
          </Link>
        </>
      ) : null}

      {hasItems ? (
        <>
          <ul className={styles.list} aria-label={CART_ITEMS_LABEL}>
            {cart.items.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.itemInfo}>
                  <Link href={`/materials/${item.id}`} className={styles.itemTitle}>
                    {item.title}
                  </Link>
                  <span className={styles.itemPrice}>
                    {formatPrice(item.priceAmount, {
                      currency: item.currency,
                      freeAsLabel: false,
                    })}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cart.removeItem(item.id)}
                  disabled={isBusy}
                >
                  {REMOVE_LABEL}
                </Button>
              </li>
            ))}
          </ul>

          <div className={styles.summary}>
            <span className={styles.total}>
              <span className={styles.totalLabel}>{TOTAL_LABEL}</span>
              <span className={styles.totalValue}>{formattedTotal}</span>
            </span>
            <span className={styles.summaryActions}>
              <Button
                variant="secondary"
                onClick={cart.clear}
                disabled={isBusy}
              >
                {CLEAR_CART_LABEL}
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckout}
                isLoading={isBusy}
              >
                {CHECKOUT_LABEL}
              </Button>
            </span>
          </div>
        </>
      ) : null}

      {/* Learner identification before a Payment can be initiated (Req 6.10). */}
      <DownloadGateModal
        isOpen={payment.isGateOpen}
        onSubmit={payment.submitGate}
        onCancel={payment.cancelGate}
        isSubmitting={payment.isSubmittingGate}
        requirePassword={payment.requirePassword}
        submitError={payment.gateError}
      />

      {/* Razorpay Checkout launcher (Req 12.5). */}
      <PaymentModal
        isOpen={payment.isModalOpen}
        order={payment.order}
        onSuccess={payment.handleCheckoutSuccess}
        onDismiss={payment.handleCheckoutDismiss}
        onFailure={payment.handleCheckoutFailure}
      />
    </main>
  );
}

export default CartPage;
