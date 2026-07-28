// Home / landing page — StudyForGovt.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./page.module.scss";
import {
  ADMIT_CARD_SERIAL,
  ADMIT_CARD_TAG,
  BUY_LABEL,
  CATALOG_EMPTY_MESSAGE,
  CATALOG_EMPTY_TITLE,
  CATALOG_ERROR_MESSAGE,
  CATALOG_ERROR_TITLE,
  CATALOG_LOADING_LABEL,
  CTA_BODY,
  CTA_PRIMARY_HREF,
  CTA_PRIMARY_LABEL,
  CTA_SECONDARY_HREF,
  CTA_SECONDARY_LABEL,
  CTA_TITLE,
  DEFAULT_EXAM_TAG,
  FREE_STAMP_LABEL,
  HERO_CATEGORY_ALL,
  HERO_CATEGORY_LABEL,
  HERO_CATEGORY_SELECT_ID,
  HERO_EYEBROW,
  HERO_SEARCH_INPUT_ID,
  HERO_SEARCH_LABEL,
  HERO_SEARCH_PLACEHOLDER,
  HERO_SEARCH_SUBMIT_LABEL,
  HERO_SUBTITLE,
  HERO_TITLE_BEFORE,
  HERO_TITLE_EMPHASIS,
  HOW_IT_WORKS_EYEBROW,
  HOW_IT_WORKS_STEPS,
  HOW_IT_WORKS_TITLE,
  OPEN_MATERIAL_LABEL,
  PAID_STAMP_LABEL,
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
  STAT_CATEGORIES_LABEL,
  STAT_MATERIALS_LABEL,
  STAT_TESTS_LABEL,
  SUBJECT_CATEGORY_TYPE_NAME,
  SUBJECTS_EYEBROW,
  SUBJECTS_LIMIT,
  SUBJECTS_SECTION_TITLE,
  TEST_LISTINGS_ERROR_MESSAGE,
  TEST_LISTINGS_ERROR_TITLE,
  TEST_LISTINGS_LOADING_LABEL,
  TEST_SERIES_EMPTY_MESSAGE,
  TEST_SERIES_EMPTY_TITLE,
  TEST_SERIES_SECTION_TITLE,
  TRENDING_DESC,
  TRENDING_EYEBROW,
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
import {
  MaterialCoverArt,
  coverVariantLabel,
  resolveCoverVariant,
} from "../components/MaterialCoverArt/MaterialCoverArt";

function firstTagName(material: CatalogMaterial): string {
  for (const tags of Object.values(material.tagsByCategoryType)) {
    if (tags.length > 0 && tags[0].name.trim().length > 0) {
      return tags[0].name;
    }
  }
  return DEFAULT_EXAM_TAG;
}

function formatRank(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function RankCard({
  material,
  rank,
}: {
  material: CatalogMaterial;
  rank: number;
}) {
  const title =
    material.title.length > 0 ? material.title : UNTITLED_MATERIAL_LABEL;
  const tag = firstTagName(material);
  const coverVariant = resolveCoverVariant(material.id);

  return (
    <Link href={`/materials/${material.id}`} className={styles.rankCard}>
      <div className={styles.rankCover}>
        <MaterialCoverArt
          variant={coverVariant}
          uid={material.id}
          className={styles.rankCoverArt}
        />
        <span className={styles.rankNum} aria-hidden="true">
          {formatRank(rank)}
        </span>
        <span className={styles.coverBadge}>
          {coverVariantLabel(coverVariant)}
        </span>
      </div>
      <div className={styles.rankCardBody}>
        <div className={styles.rankCardTop}>
          <span className={styles.examTag}>{tag}</span>
        </div>
        <h3 className={styles.rankCardTitle}>{title}</h3>
        <div className={styles.rankCardFoot}>
          <span className={styles.linkArrow}>{OPEN_MATERIAL_LABEL} →</span>
        </div>
      </div>
    </Link>
  );
}

function listingPriceLabel(
  priceAmount: number | null,
  currency: string,
): string {
  if (isFreeAmount(priceAmount)) {
    return FREE_PRICE_LABEL;
  }
  return `${priceAmount} ${resolveCurrency(currency)}`;
}

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
      <div className={styles.testCardTop}>
        <span className={free ? styles.stampFree : styles.stampPaid}>
          {free ? FREE_STAMP_LABEL : PAID_STAMP_LABEL}
        </span>
      </div>
      <h3 className={styles.testCardTitle}>{title}</h3>
      <span className={free ? styles.testCardFree : styles.testCardPrice}>
        {listingPriceLabel(priceAmount, currency)}
      </span>
      {isEntitled ? (
        <Button type="button" variant="primary" size="sm" onClick={onStart}>
          {START_TEST_LABEL}
        </Button>
      ) : (
        <Button
          type="button"
          variant="gold"
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
  const [heroCategoryId, setHeroCategoryId] = useState("");
  const [showPurchaseSuccess, setShowPurchaseSuccess] =
    useState<boolean>(false);

  const { isEntitled, reset, startProductCheckout } = payment;

  useEffect(() => {
    if (isEntitled) {
      setShowPurchaseSuccess(true);
      reset();
    }
  }, [isEntitled, reset]);

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
      const params = new URLSearchParams();
      const trimmed = heroQuery.trim();
      if (trimmed.length > 0) {
        params.set(SEARCH_QUERY_PARAM, trimmed);
      }
      if (heroCategoryId.length > 0) {
        params.set(SEARCH_CATEGORY_PARAM, heroCategoryId);
      }
      const qs = params.toString();
      router.push(qs.length > 0 ? `${SEARCH_HREF}?${qs}` : SEARCH_HREF);
    },
    [heroQuery, heroCategoryId, router],
  );

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

  const allCategories = useMemo<CatalogCategory[]>(() => {
    if (data === null) {
      return [];
    }
    return data.categoryTypes.flatMap((type) => type.categories);
  }, [data]);

  const showError = error !== null;
  const showInitialLoading = isLoading && data === null;
  const hasMaterials = data !== null && data.materials.length > 0;
  const isEmptyCatalog = data !== null && data.materials.length === 0;

  const trending = hasMaterials ? data.materials.slice(0, TRENDING_LIMIT) : [];
  const recentlyAdded = hasMaterials
    ? [...data.materials].reverse().slice(0, RECENTLY_ADDED_LIMIT)
    : [];

  const showTestsError = testsError !== null;
  const showTestsLoading = !showTestsError && isTestsLoading;
  const showTestsContent = !showTestsError && !isTestsLoading;
  const hasTestSeries = showTestsContent && testSeries.length > 0;
  const hasSectionalTests = showTestsContent && sectionalTests.length > 0;

  const materialCount = data?.materials.length ?? 0;
  const categoryCount = allCategories.length;
  const testCount = testSeries.length + sectionalTests.length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.eyebrow}>{HERO_EYEBROW}</div>
            <h1 className={styles.heroTitle}>
              {HERO_TITLE_BEFORE}
              <em>{HERO_TITLE_EMPHASIS}</em>
            </h1>
            <p className={styles.heroSubtitle}>{HERO_SUBTITLE}</p>
            {hasMaterials || categoryCount > 0 || testCount > 0 ? (
              <div className={styles.heroStats}>
                {materialCount > 0 ? (
                  <div className={styles.heroStat}>
                    <div className={styles.heroStatNum}>{materialCount}</div>
                    <div className={styles.heroStatLbl}>
                      {STAT_MATERIALS_LABEL}
                    </div>
                  </div>
                ) : null}
                {categoryCount > 0 ? (
                  <div className={styles.heroStat}>
                    <div className={styles.heroStatNum}>{categoryCount}</div>
                    <div className={styles.heroStatLbl}>
                      {STAT_CATEGORIES_LABEL}
                    </div>
                  </div>
                ) : null}
                {testCount > 0 ? (
                  <div className={styles.heroStat}>
                    <div className={styles.heroStatNum}>{testCount}</div>
                    <div className={styles.heroStatLbl}>{STAT_TESTS_LABEL}</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={styles.admitCard}>
            <span className={styles.perforation} aria-hidden="true" />
            <span
              className={`${styles.perforation} ${styles.perforationRight}`}
              aria-hidden="true"
            />
            <div className={styles.admitCardHead}>
              <span className={styles.admitTag}>{ADMIT_CARD_TAG}</span>
              <span className={styles.admitSerial}>{ADMIT_CARD_SERIAL}</span>
            </div>
            <form className={styles.admitCardBody} onSubmit={handleHeroSearch}>
              <label className={styles.fieldLabel} htmlFor={HERO_CATEGORY_SELECT_ID}>
                {HERO_CATEGORY_LABEL}
              </label>
              <div className={styles.searchField}>
                <select
                  id={HERO_CATEGORY_SELECT_ID}
                  className={styles.searchSelect}
                  value={heroCategoryId}
                  onChange={(event) => setHeroCategoryId(event.target.value)}
                >
                  <option value="">{HERO_CATEGORY_ALL}</option>
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className={styles.fieldLabel} htmlFor={HERO_SEARCH_INPUT_ID}>
                {HERO_SEARCH_LABEL}
              </label>
              <div className={styles.searchField}>
                <input
                  id={HERO_SEARCH_INPUT_ID}
                  className={styles.searchInput}
                  type="search"
                  placeholder={HERO_SEARCH_PLACEHOLDER}
                  value={heroQuery}
                  onChange={(event) => setHeroQuery(event.target.value)}
                  aria-label={HERO_SEARCH_LABEL}
                />
              </div>
              <button type="submit" className={styles.searchSubmit}>
                {HERO_SEARCH_SUBMIT_LABEL}
              </button>
            </form>
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

        {recentlyAdded.length > 0 ? (
          <section className={styles.section} id="recent">
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>
                  {RECENTLY_ADDED_SECTION_TITLE}
                </h2>
              </div>
              <Link href={SEARCH_HREF} className={styles.viewAll}>
                {VIEW_ALL_LABEL} →
              </Link>
            </div>
            <div className={styles.trendingGrid}>
              {recentlyAdded.map((material, index) => (
                <div key={material.id} className={styles.recentWrap}>
                  <RankCard material={material} rank={index} />
                  <span className={styles.recentCaption}>
                    {RECENTLY_ADDED_CAPTION}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {trending.length > 0 ? (
          <section className={styles.section} id="trending">
            <div className={styles.sectionHead}>
              <div>
                <div className={styles.sectionEyebrow}>{TRENDING_EYEBROW}</div>
                <h2 className={styles.sectionTitle}>{TRENDING_SECTION_TITLE}</h2>
              </div>
              <p className={styles.sectionDesc}>{TRENDING_DESC}</p>
            </div>
            <div className={styles.trendingGrid}>
              {trending.map((material, index) => (
                <RankCard
                  key={material.id}
                  material={material}
                  rank={index}
                />
              ))}
            </div>
            <div className={styles.sectionFooter}>
              <Link href={SEARCH_HREF} className={styles.viewAll}>
                {VIEW_ALL_LABEL} →
              </Link>
            </div>
          </section>
        ) : null}
      </div>

      {subjects.length > 0 ? (
        <section className={styles.catBand}>
          <div className={styles.catInner}>
            <div className={styles.sectionHead}>
              <div>
                <div className={styles.sectionEyebrow}>{SUBJECTS_EYEBROW}</div>
                <h2 className={styles.sectionTitle}>{SUBJECTS_SECTION_TITLE}</h2>
              </div>
            </div>
            <div className={styles.catGrid}>
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`${SEARCH_HREF}?${SEARCH_CATEGORY_PARAM}=${encodeURIComponent(subject.id)}`}
                  className={styles.catTile}
                >
                  <span className={styles.catName}>{subject.name}</span>
                  <span className={styles.catCount}>Browse →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionEyebrow}>{HOW_IT_WORKS_EYEBROW}</div>
              <h2 className={styles.sectionTitle}>{HOW_IT_WORKS_TITLE}</h2>
            </div>
          </div>
          <div className={styles.steps}>
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.index} className={styles.step}>
                <span className={styles.stepIndex}>{step.index}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div className={styles.ctaInner}>
          <div>
            <h2 className={styles.ctaTitle}>{CTA_TITLE}</h2>
            <p className={styles.ctaBody}>{CTA_BODY}</p>
          </div>
          <div className={styles.ctaActions}>
            <Link href={CTA_PRIMARY_HREF}>
              <Button type="button" variant="gold">
                {CTA_PRIMARY_LABEL}
              </Button>
            </Link>
            <Link href={CTA_SECONDARY_HREF} className={styles.ctaGhost}>
              {CTA_SECONDARY_LABEL}
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.content}>
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

        {showTestsContent ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>
                  {TEST_SERIES_SECTION_TITLE}
                </h2>
              </div>
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

        {showTestsContent ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>
                  {SECTIONAL_TESTS_SECTION_TITLE}
                </h2>
              </div>
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

      <DownloadGateModal
        isOpen={payment.isGateOpen}
        onSubmit={payment.submitGate}
        onCancel={payment.cancelGate}
        isSubmitting={payment.isSubmittingGate}
        requirePassword={payment.requirePassword}
        submitError={payment.gateError}
      />

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
