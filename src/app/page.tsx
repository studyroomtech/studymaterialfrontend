// Home / landing page (Requirements 3.1, 3.7, 3.8, 3.9, 7.5, 7.6).
//
// A visual landing page for the Platform. It loads the Material Catalog with
// `useCatalog` and presents:
//   - a hero banner with a search box that deep-links into the search page;
//   - a "Trending Study Materials" strip of cards;
//   - a "Subjects" grid of colorful tiles that filter the search page;
//   - a "Recently Added" strip of the newest materials.
// Loading, error, and empty states reuse the shared components and preserve the
// current view on failure (Req 3.8, 3.9, 7.3). All styling lives in
// `page.module.scss` (no inline CSS, Req 1.18, 1.19).

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./page.module.scss";
import {
  BUY_LABEL,
  CATALOG_EMPTY_MESSAGE,
  CATALOG_EMPTY_TITLE,
  CATALOG_ERROR_MESSAGE,
  CATALOG_ERROR_TITLE,
  CATALOG_LOADING_LABEL,
  DEFAULT_SUBJECT_ICON,
  HERO_ART_ICON,
  HERO_SEARCH_INPUT_ID,
  HERO_SEARCH_LABEL,
  HERO_SEARCH_PLACEHOLDER,
  HERO_SEARCH_SUBMIT_LABEL,
  HERO_SUBTITLE,
  HERO_TITLE,
  MATERIAL_ICON,
  OPEN_MATERIAL_LABEL,
  PURCHASE_FAILED_FALLBACK,
  PURCHASE_FAILED_TITLE,
  PURCHASE_SUCCESS_MESSAGE,
  RECENTLY_ADDED_CAPTION,
  RECENTLY_ADDED_LIMIT,
  RECENTLY_ADDED_SECTION_TITLE,
  SEARCH_CATEGORY_PARAM,
  SEARCH_HREF,
  SEARCH_QUERY_PARAM,
  SECTIONAL_TESTS_EMPTY_MESSAGE,
  SECTIONAL_TESTS_EMPTY_TITLE,
  SECTIONAL_TESTS_SECTION_TITLE,
  START_TEST_LABEL,
  SUBJECT_CATEGORY_TYPE_NAME,
  SUBJECT_ICON_BY_NAME,
  SUBJECTS_LIMIT,
  SUBJECTS_SECTION_TITLE,
  TEST_ICON,
  TEST_LISTINGS_ERROR_MESSAGE,
  TEST_LISTINGS_ERROR_TITLE,
  TEST_LISTINGS_LOADING_LABEL,
  TEST_SERIES_EMPTY_MESSAGE,
  TEST_SERIES_EMPTY_TITLE,
  TEST_SERIES_SECTION_TITLE,
  TRENDING_LIMIT,
  TRENDING_SECTION_TITLE,
  UNTITLED_MATERIAL_LABEL,
  VIEW_ALL_LABEL,
} from "./page.constant";
import Button from "../components/Button/Button";
import DownloadGateModal from "../components/DownloadGateModal/DownloadGateModal";
import EmptyState from "../components/EmptyState/EmptyState";
import Footer from "../components/Footer/Footer";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";
import Input from "../components/Input/Input";
import LoadingIndicator from "../components/LoadingIndicator/LoadingIndicator";
import PaymentModal from "../components/PaymentModal/PaymentModal";
import { usePayment } from "../hooks/api/usePayment";
import { PAYMENT_PHASE } from "../hooks/api/usePayment.constant";
import { useCatalog } from "../hooks/api/useCatalog";
import { useTestListings } from "../hooks/api/useTestListings";
import type { ProductRef } from "../types/testSeries.types";
import { isFreeAmount, resolveCurrency } from "../utils/price";
import { FREE_PRICE_LABEL } from "../utils/price.constant";
import type {
  CatalogCategory,
  CatalogMaterial,
} from "../utils/catalogTree.types";

/** Resolve the decorative emoji for a subject tile from its name. */
function subjectIcon(name: string): string {
  return SUBJECT_ICON_BY_NAME[name.trim().toLowerCase()] ?? DEFAULT_SUBJECT_ICON;
}

/** A single Study Material card linking to the material's view page. */
function MaterialCard({ material }: { material: CatalogMaterial }) {
  const title =
    material.title.length > 0 ? material.title : UNTITLED_MATERIAL_LABEL;
  return (
    <Link href={`/materials/${material.id}`} className={styles.materialCard}>
      <span className={styles.materialThumb} aria-hidden="true">
        {MATERIAL_ICON}
      </span>
      <span className={styles.materialCardBody}>
        <span className={styles.materialCardTitle}>{title}</span>
        <span className={styles.materialCardAction}>{OPEN_MATERIAL_LABEL} →</span>
      </span>
    </Link>
  );
}

/**
 * Render a listing's Price for display. A product with no Price or a zero Price
 * shows the shared free indicator; a priced product shows its integer amount in
 * the smallest currency unit (paise) alongside its resolved Currency (Req 6.2,
 * 6.3). Classification and the free label come from the shared `utils/price`.
 */
function listingPriceLabel(
  priceAmount: number | null,
  currency: string,
): string {
  if (isFreeAmount(priceAmount)) {
    return FREE_PRICE_LABEL;
  }
  return `${priceAmount} ${resolveCurrency(currency)}`;
}

/**
 * A single Test Series / Sectional Test listing card: the product's title, its
 * Price (or free indicator), and an ownership-aware call-to-action. When the
 * Learner already owns the product (`isEntitled`), the card renders a "Start
 * test" action that hands off to the parent's `onStart`, which navigates into
 * the product's attempt route to begin/resume the test rather than initiating a
 * purchase (Req 2.1, 2.2, 2.4). Otherwise it renders the "Buy" action, handing
 * the product reference to the parent's `onBuy`, which drives the shared
 * `usePayment` product-cart checkout (Req 7.1); the Buy button is disabled while
 * any purchase is in flight so two carts cannot be initiated at once.
 */
function ListingCard({
  title,
  priceAmount,
  currency,
  isEntitled,
  onBuy,
  onStart,
  disabled,
}: {
  title: string;
  priceAmount: number | null;
  currency: string;
  isEntitled: boolean;
  onBuy: () => void;
  onStart: () => void;
  disabled: boolean;
}) {
  const free = isFreeAmount(priceAmount);
  return (
    <div className={styles.testCard}>
      <span className={styles.testThumb} aria-hidden="true">
        {TEST_ICON}
      </span>
      <div className={styles.testCardBody}>
        <span className={styles.testCardTitle}>{title}</span>
        <span className={free ? styles.testCardFree : styles.testCardPrice}>
          {listingPriceLabel(priceAmount, currency)}
        </span>
      </div>
      {isEntitled ? (
        <Button type="button" variant="primary" size="sm" onClick={onStart}>
          {START_TEST_LABEL}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onBuy}
          disabled={disabled}
        >
          {BUY_LABEL}
        </Button>
      )}
    </div>
  );
}

function HomePage() {
  const router = useRouter();
  const { data, isLoading, error } = useCatalog();
  const {
    testSeries,
    sectionalTests,
    isLoading: isTestsLoading,
    error: testsError,
  } = useTestListings();
  const payment = usePayment();
  const [heroQuery, setHeroQuery] = useState("");
  const [showPurchaseSuccess, setShowPurchaseSuccess] =
    useState<boolean>(false);

  const { isEntitled, reset, startProductCheckout } = payment;

  // On a verified product-cart Payment: show success and reset the flow so the
  // Learner can purchase again (Req 7.4). Entitlement-derived listing state is
  // owned by the server; the Home Page just confirms the outcome.
  useEffect(() => {
    if (isEntitled) {
      setShowPurchaseSuccess(true);
      reset();
    }
  }, [isEntitled, reset]);

  // A purchase is in flight while the order is being initiated or verified;
  // disable every Buy button so only one product-cart order runs at a time.
  const isPurchasing = payment.isInitiating || payment.isVerifying;

  const buyProduct = useCallback(
    (product: ProductRef): void => {
      setShowPurchaseSuccess(false);
      startProductCheckout([product]);
    },
    [startProductCheckout],
  );

  const showPurchaseFailure =
    payment.phase === PAYMENT_PHASE.failed &&
    payment.failureMessage !== undefined;

  const handleHeroSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = heroQuery.trim();
      const href =
        trimmed.length > 0
          ? `${SEARCH_HREF}?${SEARCH_QUERY_PARAM}=${encodeURIComponent(trimmed)}`
          : SEARCH_HREF;
      router.push(href);
    },
    [heroQuery, router],
  );

  // Subjects come from the "Subject" Category Type; fall back to every category
  // across all types when no dedicated Subject type exists yet.
  const subjects = useMemo<CatalogCategory[]>(() => {
    if (data === null) {
      return [];
    }
    const subjectType = data.categoryTypes.find(
      (type) => type.name === SUBJECT_CATEGORY_TYPE_NAME,
    );
    const source =
      subjectType && subjectType.categories.length > 0
        ? subjectType.categories
        : data.categoryTypes.flatMap((type) => type.categories);
    return source.slice(0, SUBJECTS_LIMIT);
  }, [data]);

  const showError = error !== null;
  const showInitialLoading = isLoading && data === null;
  const hasMaterials = data !== null && data.materials.length > 0;
  const isEmptyCatalog = data !== null && data.materials.length === 0;

  const trending = hasMaterials
    ? data.materials.slice(0, TRENDING_LIMIT)
    : [];
  // The catalog is ordered oldest→newest, so the newest materials are at the
  // end; reverse a copy to surface the most recent first.
  const recentlyAdded = hasMaterials
    ? [...data.materials].reverse().slice(0, RECENTLY_ADDED_LIMIT)
    : [];

  // Test listings states (Req 6.5–6.7). On failure the hook returns empty
  // arrays, so gating the empty-states and rows on `!showTestsError` guarantees
  // no partial, stale, or empty-state content is shown on error (Req 6.7). The
  // loading indicator is shown while the request is in flight and suppresses
  // both sections' empty-states (Req 6.5).
  const showTestsError = testsError !== null;
  const showTestsLoading = !showTestsError && isTestsLoading;
  const showTestsContent = !showTestsError && !isTestsLoading;
  const hasTestSeries = showTestsContent && testSeries.length > 0;
  const hasSectionalTests = showTestsContent && sectionalTests.length > 0;

  return (
    <div className={styles.page}>
      {/* Hero banner (Req 7.5). */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{HERO_TITLE}</h1>
            <p className={styles.heroSubtitle}>{HERO_SUBTITLE}</p>
            <form className={styles.heroSearch} onSubmit={handleHeroSearch}>
              <Input
                id={HERO_SEARCH_INPUT_ID}
                className={styles.heroSearchInput}
                label={HERO_SEARCH_LABEL}
                hideLabel
                type="search"
                placeholder={HERO_SEARCH_PLACEHOLDER}
                value={heroQuery}
                onChange={(event) => setHeroQuery(event.target.value)}
              />
              <Button type="submit" variant="primary">
                {HERO_SEARCH_SUBMIT_LABEL}
              </Button>
            </form>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.heroArtIcon}>{HERO_ART_ICON}</span>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        {showError ? (
          <ErrorMessage
            title={CATALOG_ERROR_TITLE}
            message={CATALOG_ERROR_MESSAGE}
            className={styles.status}
          />
        ) : null}

        {showInitialLoading ? (
          <LoadingIndicator
            label={CATALOG_LOADING_LABEL}
            fullPanel
            className={styles.status}
          />
        ) : null}

        {isEmptyCatalog ? (
          <EmptyState
            title={CATALOG_EMPTY_TITLE}
            message={CATALOG_EMPTY_MESSAGE}
            className={styles.status}
          />
        ) : null}

        {/* Trending materials. */}
        {trending.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{TRENDING_SECTION_TITLE}</h2>
              <Link href={SEARCH_HREF} className={styles.viewAll}>
                {VIEW_ALL_LABEL}
              </Link>
            </div>
            <div className={styles.materialGrid}>
              {trending.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Subject tiles. */}
        {subjects.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{SUBJECTS_SECTION_TITLE}</h2>
              <Link href={SEARCH_HREF} className={styles.viewAll}>
                {VIEW_ALL_LABEL}
              </Link>
            </div>
            <ul className={styles.subjectGrid}>
              {subjects.map((subject) => (
                <li key={subject.id} className={styles.subjectItem}>
                  <Link
                    href={`${SEARCH_HREF}?${SEARCH_CATEGORY_PARAM}=${encodeURIComponent(subject.id)}`}
                    className={styles.subjectTile}
                  >
                    <span className={styles.subjectIcon} aria-hidden="true">
                      {subjectIcon(subject.name)}
                    </span>
                    <span className={styles.subjectName}>{subject.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Recently added materials. */}
        {recentlyAdded.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {RECENTLY_ADDED_SECTION_TITLE}
              </h2>
              <Link href={SEARCH_HREF} className={styles.viewAll}>
                {VIEW_ALL_LABEL}
              </Link>
            </div>
            <div className={styles.materialGrid}>
              {recentlyAdded.map((material) => (
                <div key={material.id} className={styles.recentCardWrap}>
                  <MaterialCard material={material} />
                  <span className={styles.recentCaption}>
                    {RECENTLY_ADDED_CAPTION}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Test listings: a single failed load replaces both sections with an
            error message and shows no partial/stale/empty content (Req 6.7);
            while loading, a single loading indicator covers both sections and
            no empty-state is shown (Req 6.5). */}
        {showTestsError ? (
          <ErrorMessage
            title={TEST_LISTINGS_ERROR_TITLE}
            message={TEST_LISTINGS_ERROR_MESSAGE}
            className={styles.status}
          />
        ) : null}

        {showTestsLoading ? (
          <LoadingIndicator
            label={TEST_LISTINGS_LOADING_LABEL}
            fullPanel
            className={styles.status}
          />
        ) : null}

        {/* Product-cart purchase outcome (Req 7.4, 7.5). A verified Payment
            confirms success; an initiation/verification failure surfaces the
            backend envelope message (ALREADY_ENTITLED / PAYMENT_NOT_REQUIRED /
            VALIDATION_ERROR) inline, in addition to the global Toast. */}
        {showPurchaseSuccess ? (
          <p className={styles.status} role="status">
            {PURCHASE_SUCCESS_MESSAGE}
          </p>
        ) : null}

        {showPurchaseFailure ? (
          <ErrorMessage
            title={PURCHASE_FAILED_TITLE}
            message={payment.failureMessage ?? PURCHASE_FAILED_FALLBACK}
            onRetry={payment.reset}
            className={styles.status}
          />
        ) : null}

        {/* Test Series section (every Test, including free), in the
            server-provided deterministic order (Req 6.1, 6.4). */}
        {showTestsContent ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {TEST_SERIES_SECTION_TITLE}
              </h2>
            </div>
            {hasTestSeries ? (
              <div className={styles.testGrid}>
                {testSeries.map((test) => (
                  <ListingCard
                    key={test.id}
                    title={test.title}
                    priceAmount={test.priceAmount}
                    currency={test.currency}
                    isEntitled={test.isEntitled}
                    disabled={isPurchasing}
                    onBuy={() => buyProduct({ type: "test", id: test.id })}
                    onStart={() => router.push(`/tests/${test.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={TEST_SERIES_EMPTY_TITLE}
                message={TEST_SERIES_EMPTY_MESSAGE}
                className={styles.status}
              />
            )}
          </section>
        ) : null}

        {/* Sectional Tests section (Sections with a positive Price), in the
            server-provided deterministic order (Req 6.1, 6.4). */}
        {showTestsContent ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {SECTIONAL_TESTS_SECTION_TITLE}
              </h2>
            </div>
            {hasSectionalTests ? (
              <div className={styles.testGrid}>
                {sectionalTests.map((section) => (
                  <ListingCard
                    key={section.sectionId}
                    title={section.title}
                    priceAmount={section.priceAmount}
                    currency={section.currency}
                    isEntitled={section.isEntitled}
                    disabled={isPurchasing}
                    onBuy={() =>
                      buyProduct({ type: "section", id: section.sectionId })
                    }
                    onStart={() =>
                      router.push(`/sections/${section.sectionId}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={SECTIONAL_TESTS_EMPTY_TITLE}
                message={SECTIONAL_TESTS_EMPTY_MESSAGE}
                className={styles.status}
              />
            )}
          </section>
        ) : null}
      </div>

      {/* Learner identification before a product-cart Payment can be initiated
          (Req 7.3, 6.10). */}
      <DownloadGateModal
        isOpen={payment.isGateOpen}
        onSubmit={payment.submitGate}
        onCancel={payment.cancelGate}
        isSubmitting={payment.isSubmittingGate}
        requirePassword={payment.requirePassword}
        submitError={payment.gateError}
      />

      {/* Razorpay Checkout launcher for the product-cart buy flow (Req 7.1). */}
      <PaymentModal
        isOpen={payment.isModalOpen}
        order={payment.order}
        onSuccess={payment.handleCheckoutSuccess}
        onDismiss={payment.handleCheckoutDismiss}
        onFailure={payment.handleCheckoutFailure}
      />

      <Footer />
    </div>
  );
}

export default HomePage;
