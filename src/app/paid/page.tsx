// Paid Materials Tab page (Requirements 12.1, 12.2, 12.3, 12.5).
//
// Lets a Learner browse Paid Materials and, after a successful Payment, view or
// download them:
//   - `usePaidMaterials` lists each Paid Material with its Price amount and
//     Currency; every entry is rendered with `PaidMaterialCard`, which shows the
//     formatted Price and an entitlement-aware action (Buy vs View/Download)
//     (Req 12.1, 12.3).
//   - The buy flow is driven by `usePayment`: it ensures a learner Access Token
//     (surfacing the `DownloadGateModal` to collect name + email when none is
//     present — Req 6.10), initiates a Razorpay order, launches Razorpay
//     Checkout via `PaymentModal` (Req 12.5), and verifies the result
//     server-side before reflecting the entitled outcome (Req 12.6).
//   - Once entitled (in this session), the card switches to View/Download and
//     the action is orchestrated by `useDownload`, which resolves the entitled
//     content and follows the presigned URL (Req 12.2).
//
// Loading and error/timeout states are surfaced without wiping the listing or
// user-entered data (Req 7.3, 8.1, 8.2). All styling lives in `page.module.scss`
// (no inline CSS, Req 1.19).

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import DownloadGateModal from "@/components/DownloadGateModal/DownloadGateModal";
import EmptyState from "@/components/EmptyState/EmptyState";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";
import PaidMaterialCard from "@/components/PaidMaterialCard/PaidMaterialCard";
import PaymentModal from "@/components/PaymentModal/PaymentModal";
import { useDownload } from "@/hooks/api/useDownload";
import { usePaidMaterials } from "@/hooks/api/usePaidMaterials";
import { usePayment } from "@/hooks/api/usePayment";
import { PAYMENT_PHASE } from "@/hooks/api/usePayment.constant";
import { useCart } from "@/hooks/useCart";
import { DEFAULT_CURRENCY } from "@/utils/price.constant";

import styles from "./page.module.scss";
import {
  PAID_EMPTY_MESSAGE,
  PAID_EMPTY_TITLE,
  PAID_ERROR_MESSAGE,
  PAID_ERROR_TITLE,
  PAID_LOADING_LABEL,
  PAID_PAGE_SUBTITLE,
  PAID_PAGE_TITLE,
  PAID_RESULTS_LABEL,
  PAYMENT_FAILED_TITLE,
  PAYMENT_SUCCESS_MESSAGE,
} from "./page.constant";

function PaidMaterialsPage() {
  const { data, isLoading, error } = usePaidMaterials();
  const payment = usePayment();
  const download = useDownload();
  const cart = useCart();

  // Payment Entitlements granted during this session. The listing endpoint does
  // not report entitlement, so a card starts as "Buy" and flips to
  // "View/Download" once a Payment succeeds here (Req 12.3).
  const [entitledIds, setEntitledIds] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const { isEntitled, activeMaterialId, reset } = payment;

  // Reflect a verified Payment: mark the material entitled and clear the
  // orchestration so a fresh Payment can be started later (Req 12.6, 12.8).
  useEffect(() => {
    if (isEntitled && activeMaterialId !== null) {
      const grantedId = activeMaterialId;
      setEntitledIds((prev) => {
        if (prev.has(grantedId)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(grantedId);
        return next;
      });
      setShowSuccess(true);
      reset();
    }
  }, [isEntitled, activeMaterialId, reset]);

  const materials = useMemo(() => data?.materials ?? [], [data]);

  // The material a Payment is currently in progress for, used for the checkout
  // description shown in the PaymentModal (Req 12.5).
  const activeMaterial = useMemo(
    () =>
      materials.find((material) => material.id === payment.activeMaterialId) ??
      null,
    [materials, payment.activeMaterialId],
  );

  const handleBuy = useCallback(
    (materialId: string) => {
      setShowSuccess(false);
      payment.startPayment(materialId);
    },
    [payment],
  );

  const handleView = useCallback(
    (materialId: string) => {
      download.requestDownload(materialId);
    },
    [download],
  );

  // Only replace the whole panel with the loading/error affordance before the
  // first successful load; afterwards keep the listing visible while a new
  // request runs or fails, preserving the view (Req 8.1).
  const showLoadingPanel = isLoading && data === null;
  const showErrorPanel = error !== null && data === null;
  const showInlineError = error !== null && data !== null;
  const showEmpty = data !== null && error === null && materials.length === 0;
  const showResults = materials.length > 0;

  const showPaymentFailure =
    payment.phase === PAYMENT_PHASE.failed &&
    payment.failureMessage !== undefined;
  const showDownloadError = download.error !== null;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>{PAID_PAGE_TITLE}</h1>
        <p className={styles.subtitle}>{PAID_PAGE_SUBTITLE}</p>
      </header>

      {showSuccess ? (
        <p className={styles.successBanner} role="status">
          {PAYMENT_SUCCESS_MESSAGE}
        </p>
      ) : null}

      {showPaymentFailure ? (
        <ErrorMessage
          title={PAYMENT_FAILED_TITLE}
          message={payment.failureMessage ?? PAID_ERROR_MESSAGE}
          onRetry={payment.reset}
        />
      ) : null}

      {showDownloadError ? (
        <ErrorMessage
          title={PAID_ERROR_TITLE}
          message={download.error?.message ?? PAID_ERROR_MESSAGE}
        />
      ) : null}

      <section className={styles.results} aria-label={PAID_RESULTS_LABEL}>
        {showLoadingPanel ? (
          <LoadingIndicator fullPanel label={PAID_LOADING_LABEL} />
        ) : null}

        {(showErrorPanel || showInlineError) && (
          <ErrorMessage title={PAID_ERROR_TITLE} message={PAID_ERROR_MESSAGE} />
        )}

        {showEmpty ? (
          <EmptyState title={PAID_EMPTY_TITLE} message={PAID_EMPTY_MESSAGE} />
        ) : null}

        {showResults ? (
          <ul className={styles.cardList}>
            {materials.map((material) => {
              const entitled =
                material.isEntitled === true || entitledIds.has(material.id);
              const isActive = payment.activeMaterialId === material.id;
              const isBusy =
                (isActive && (payment.isInitiating || payment.isVerifying)) ||
                (entitled && download.isDownloading);

              return (
                <li key={material.id} className={styles.cardItem}>
                  <PaidMaterialCard
                    materialId={material.id}
                    title={material.title}
                    description={material.description}
                    priceAmount={material.priceAmount}
                    currency={material.currency ?? undefined}
                    isEntitled={entitled}
                    onBuy={handleBuy}
                    onView={handleView}
                    isBusy={isBusy}
                    isInCart={cart.has(material.id)}
                    onAddToCart={() =>
                      cart.addItem({
                        id: material.id,
                        title: material.title,
                        priceAmount: material.priceAmount ?? 0,
                        currency: material.currency ?? DEFAULT_CURRENCY,
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {/* Download Gate for the buy flow: collects the Learner's identity before
          a Payment can be initiated (Req 6.10). */}
      <DownloadGateModal
        isOpen={payment.isGateOpen}
        onSubmit={payment.submitGate}
        onCancel={payment.cancelGate}
        isSubmitting={payment.isSubmittingGate}
        submitError={payment.gateError}
      />

      {/* Download Gate for viewing/downloading an entitled Paid Material when no
          valid Access Token is present (Req 6.1, 6.7). */}
      <DownloadGateModal
        isOpen={download.isGateOpen}
        onSubmit={download.submitGate}
        onCancel={download.cancelGate}
        isSubmitting={download.isSubmittingGate}
        submitError={download.gateError}
      />

      {/* Razorpay Checkout launcher for the buy flow (Req 12.5). */}
      <PaymentModal
        isOpen={payment.isModalOpen}
        order={payment.order}
        materialTitle={activeMaterial?.title}
        onSuccess={payment.handleCheckoutSuccess}
        onDismiss={payment.handleCheckoutDismiss}
        onFailure={payment.handleCheckoutFailure}
      />
    </main>
  );
}

export default PaidMaterialsPage;
