"use client";

// Study Material view page (Requirements 5.1, 5.2, 5.5, 12.3).
//
// Loads a single Study Material's content from `GET /api/materials/:id` via the
// `useMaterial` hook and displays it (Req 5.1). While the content is being
// retrieved a loading indicator is shown until the content is displayed or an
// error is surfaced (Req 5.2). If the request errors or does not respond within
// the hook's 5-second budget, an error message is shown and no partial content
// is rendered (Req 5.5). A download action is wired through `useDownload` and the
// shared DownloadGateModal.
//
// Entitlement-aware behavior (Req 12.3): a Free Material — or a Paid Material the
// Learner is already entitled to — returns `200` with content and is rendered
// normally. A Paid Material the Learner is NOT entitled to returns
// `403 PAYMENT_REQUIRED` with no content; in that case the page shows the
// material's Price and a "Pay to unlock" call-to-action instead of the content.
// The pay flow reuses `usePayment` (order initiation + verification), the
// `PaymentModal` (Razorpay Checkout, Req 12.5), and the `DownloadGateModal`
// (learner identification, Req 6.10). Once a Payment grants an Entitlement, the
// view reloads so the now-accessible content is fetched and shown (Req 12.2).
//
// All styling lives in `page.module.scss` (no inline CSS); constants live in
// `page.constant.ts` and shared DTO types come from the hooks' `*.types.ts`.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import Button from "@/components/Button/Button";
import DownloadGateModal from "@/components/DownloadGateModal/DownloadGateModal";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";
import NotesPreview from "@/components/NotesPreview/NotesPreview";
import PaymentModal from "@/components/PaymentModal/PaymentModal";
import ReviewsSection from "@/components/ReviewsSection/ReviewsSection";
import { usePaidMaterials } from "@/hooks/api/usePaidMaterials";
import { usePayment } from "@/hooks/api/usePayment";
import { PAYMENT_PHASE } from "@/hooks/api/usePayment.constant";
import { useDownload } from "@/hooks/api/useDownload";
import { useMaterial } from "@/hooks/api/useMaterial";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/price";
import { DEFAULT_CURRENCY } from "@/utils/price.constant";
import type { HttpError } from "@/utils/http.types";

import styles from "./page.module.scss";
import {
  BACK_TO_CATALOG_LABEL,
  CATALOG_HREF,
  DESCRIPTION_HEADING,
  DOWNLOAD_ERROR_TITLE,
  DOWNLOAD_LABEL,
  INVALID_ID_MESSAGE,
  LOAD_ERROR_MESSAGE,
  LOAD_ERROR_TITLE,
  LOADING_LABEL,
  LOCKED_MESSAGE,
  LOCKED_TITLE,
  NO_DESCRIPTION_TEXT,
  NOT_FOUND_ERROR_MESSAGE,
  NOT_FOUND_STATUS,
  ADD_TO_CART_LABEL,
  IN_CART_LABEL,
  PAY_ACTION_LABEL,
  PAYMENT_FAILED_MESSAGE,
  PAYMENT_FAILED_TITLE,
  PAYMENT_REQUIRED_CODE,
  PAYMENT_REQUIRED_STATUS,
  PRICE_LABEL,
  PRICE_LOADING_LABEL,
  TIMEOUT_ERROR_KIND,
  TIMEOUT_ERROR_MESSAGE,
} from "./page.constant";
import type {
  MaterialContentProps,
  PaymentRequiredGateProps,
} from "./page.types";

/**
 * Resolve the material id from the dynamic route params. A catch-all/array value
 * is narrowed to its first entry; an absent id yields an empty string.
 * @param rawId the raw `id` route param.
 * @returns the material id, or an empty string when none is present.
 */
function resolveMaterialId(rawId: string | string[] | undefined): string {
  if (typeof rawId === "string") {
    return rawId;
  }
  if (Array.isArray(rawId)) {
    return rawId[0] ?? "";
  }
  return "";
}

/**
 * Choose the user-facing message for a failed material request (Req 5.4, 5.5).
 * @param error the typed request failure.
 * @returns the message describing why the material could not be loaded.
 */
function resolveErrorMessage(error: HttpError): string {
  if (error.status === NOT_FOUND_STATUS) {
    return NOT_FOUND_ERROR_MESSAGE;
  }
  if (error.kind === TIMEOUT_ERROR_KIND) {
    return TIMEOUT_ERROR_MESSAGE;
  }
  return LOAD_ERROR_MESSAGE;
}

/**
 * Determine whether a failed material request is the Paid-Material entitlement
 * gate (`403 PAYMENT_REQUIRED`), which prompts a Payment rather than a plain
 * error (Req 12.3).
 * @param error the typed request failure.
 * @returns `true` when the request was denied for lack of a Payment Entitlement.
 */
function isPaymentRequired(error: HttpError): boolean {
  return (
    error.status === PAYMENT_REQUIRED_STATUS &&
    error.code === PAYMENT_REQUIRED_CODE
  );
}

/** Reload the current view so a failed material request can be re-attempted. */
function reloadView(): void {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

function MaterialViewPage() {
  const params = useParams();
  const materialId = resolveMaterialId(params?.id);
  const hasId = materialId.length > 0;

  const { data, isLoading, error } = useMaterial(hasId ? materialId : null);
  const {
    requestDownload,
    submitGate,
    cancelGate,
    isGateOpen,
    isDownloading,
    isSubmittingGate,
    error: downloadError,
    gateError,
    requirePassword,
    requestPreview,
    previewUrl,
    previewContentType,
    isPreviewing,
    clearPreview,
  } = useDownload();

  // Auto-load the inline preview as soon as the material is available, once per
  // material. When no valid Access Token is present this surfaces the Download
  // Gate (learner identification) before the preview URL is fetched.
  const previewRequestedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (data !== null && previewRequestedForRef.current !== data.id) {
      previewRequestedForRef.current = data.id;
      requestPreview(data.id);
    }
  }, [data, requestPreview]);

  // No id in the route: nothing can be loaded (Req 5.5 — no partial content).
  if (!hasId) {
    return (
      <main className={styles.main}>
        <Link href={CATALOG_HREF} className={styles.backLink}>
          {BACK_TO_CATALOG_LABEL}
        </Link>
        <ErrorMessage
          title={LOAD_ERROR_TITLE}
          message={INVALID_ID_MESSAGE}
          className={styles.error}
        />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Link href={CATALOG_HREF} className={styles.backLink}>
        {BACK_TO_CATALOG_LABEL}
      </Link>

      {/* While the content is being retrieved, show only the loading indicator
          until the content is displayed or an error is shown (Req 5.2). */}
      {isLoading && data === null ? (
        <LoadingIndicator
          fullPanel
          label={LOADING_LABEL}
          className={styles.loading}
        />
      ) : null}

      {/* Paid Material the Learner is not entitled to: show the Price and a pay
          call-to-action instead of content (Req 12.3), never partial content. */}
      {!isLoading && data === null && error !== null && isPaymentRequired(error) ? (
        <PaymentRequiredGate materialId={materialId} onEntitled={reloadView} />
      ) : null}

      {/* On any other failure with no loaded content, show an error message and
          never any partial content (Req 5.5). */}
      {!isLoading &&
      data === null &&
      error !== null &&
      !isPaymentRequired(error) ? (
        <ErrorMessage
          title={LOAD_ERROR_TITLE}
          message={resolveErrorMessage(error)}
          onRetry={reloadView}
          className={styles.error}
        />
      ) : null}

      {data !== null ? (
        <>
          <MaterialContent
            title={data.title}
            description={data.description}
            fileName={data.fileName}
            isDownloading={isDownloading}
            downloadError={downloadError}
            onDownload={() => requestDownload(data.id)}
            previewUrl={previewUrl}
            previewContentType={previewContentType}
            isPreviewing={isPreviewing}
            onRequestPreview={() => requestPreview(data.id)}
            onClearPreview={clearPreview}
          />
          <ReviewsSection materialId={data.id} isPaid={data.isPaid} />
        </>
      ) : null}

      <DownloadGateModal
        isOpen={isGateOpen}
        onSubmit={submitGate}
        onCancel={cancelGate}
        isSubmitting={isSubmittingGate}
        requirePassword={requirePassword}
        submitError={gateError}
      />
    </main>
  );
}

function MaterialContent({
  title,
  description,
  fileName,
  isDownloading,
  downloadError,
  onDownload,
  previewUrl,
  previewContentType,
  isPreviewing,
  onRequestPreview,
  onClearPreview,
}: MaterialContentProps) {
  return (
    <article className={styles.content}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <Button
          variant="primary"
          onClick={onDownload}
          isLoading={isDownloading}
        >
          {DOWNLOAD_LABEL}
        </Button>
      </header>

      {downloadError !== null ? (
        <ErrorMessage
          title={DOWNLOAD_ERROR_TITLE}
          message={downloadError.message}
          className={styles.error}
        />
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{DESCRIPTION_HEADING}</h2>
        <p className={styles.description}>
          {description.length > 0 ? description : NO_DESCRIPTION_TEXT}
        </p>
      </section>

      {/* Inline preview of the notes, loaded on demand (Req 5.1). */}
      <NotesPreview
        previewUrl={previewUrl}
        contentType={previewContentType}
        fileName={fileName}
        isLoading={isPreviewing}
        onRequestPreview={onRequestPreview}
        onClose={onClearPreview}
      />
    </article>
  );
}

/**
 * Entitlement gate shown when the view request returns `403 PAYMENT_REQUIRED`
 * for a Paid Material the Learner is not entitled to (Req 12.3).
 *
 * Because the `403` withholds all content (including the Price), the gate looks
 * the material up in the Paid Materials listing (`usePaidMaterials`) to display
 * its title and formatted Price (Req 12.1). The pay flow is orchestrated by
 * `usePayment`: it surfaces the `DownloadGateModal` to identify the Learner when
 * no valid Access Token is present (Req 6.10), initiates a Razorpay order, and
 * launches Razorpay Checkout via `PaymentModal` (Req 12.5). Once a Payment is
 * verified server-side and an Entitlement is granted, the view reloads so the
 * now-accessible content is fetched and shown (Req 12.2, 12.6).
 */
function PaymentRequiredGate({ materialId, onEntitled }: PaymentRequiredGateProps) {
  const { data: paidData, isLoading: isPriceLoading } = usePaidMaterials();
  const payment = usePayment();
  const cart = useCart();

  const { isEntitled, reset } = payment;

  // The matching Paid Material from the listing, used to show its title/Price.
  const paidMaterial = useMemo(
    () =>
      paidData?.materials.find((material) => material.id === materialId) ??
      null,
    [paidData, materialId],
  );

  // Once a Payment is verified and access is granted, reload so the content is
  // fetched and displayed (Req 12.2, 12.6).
  useEffect(() => {
    if (isEntitled) {
      reset();
      onEntitled();
    }
  }, [isEntitled, reset, onEntitled]);

  const heading = paidMaterial?.title ?? LOCKED_TITLE;
  const hasPrice = paidMaterial !== null;
  const formattedPrice = hasPrice
    ? formatPrice(paidMaterial.priceAmount, {
        currency: paidMaterial.currency ?? undefined,
        freeAsLabel: false,
      })
    : null;

  const showPaymentFailure =
    payment.phase === PAYMENT_PHASE.failed &&
    !payment.isGateOpen &&
    !payment.isModalOpen;
  const isPayBusy = payment.isInitiating || payment.isVerifying;

  return (
    <section className={styles.locked} aria-live="polite">
      <h1 className={styles.title}>{heading}</h1>
      <p className={styles.lockedMessage}>{LOCKED_MESSAGE}</p>

      <div className={styles.priceRow}>
        <span className={styles.priceLabel}>{PRICE_LABEL}</span>
        {isPriceLoading && paidData === null ? (
          <LoadingIndicator label={PRICE_LOADING_LABEL} />
        ) : (
          <span className={styles.priceValue}>{formattedPrice ?? "—"}</span>
        )}
      </div>

      {showPaymentFailure ? (
        <ErrorMessage
          title={PAYMENT_FAILED_TITLE}
          message={payment.failureMessage ?? PAYMENT_FAILED_MESSAGE}
          onRetry={payment.reset}
          className={styles.error}
        />
      ) : null}

      <div className={styles.payActions}>
        <Button
          variant="primary"
          onClick={() => payment.startPayment(materialId)}
          isLoading={isPayBusy}
        >
          {PAY_ACTION_LABEL}
        </Button>
        <Button
          variant="secondary"
          disabled={cart.has(materialId) || paidMaterial === null}
          onClick={() =>
            cart.addItem({
              id: materialId,
              title: paidMaterial?.title ?? heading,
              priceAmount: paidMaterial?.priceAmount ?? 0,
              currency: paidMaterial?.currency ?? DEFAULT_CURRENCY,
            })
          }
        >
          {cart.has(materialId) ? IN_CART_LABEL : ADD_TO_CART_LABEL}
        </Button>
      </div>

      {/* Collects the Learner's name + email before a Payment can be initiated
          when no valid Access Token is present (Req 6.10). */}
      <DownloadGateModal
        isOpen={payment.isGateOpen}
        onSubmit={payment.submitGate}
        onCancel={payment.cancelGate}
        isSubmitting={payment.isSubmittingGate}
        requirePassword={payment.requirePassword}
        submitError={payment.gateError}
      />

      {/* Launches Razorpay Checkout with the returned order details (Req 12.5). */}
      <PaymentModal
        isOpen={payment.isModalOpen}
        order={payment.order}
        materialTitle={paidMaterial?.title}
        onSuccess={payment.handleCheckoutSuccess}
        onDismiss={payment.handleCheckoutDismiss}
        onFailure={payment.handleCheckoutFailure}
      />
    </section>
  );
}

export default MaterialViewPage;
