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

import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./page.module.scss";
import {
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
  RECENTLY_ADDED_CAPTION,
  RECENTLY_ADDED_LIMIT,
  RECENTLY_ADDED_SECTION_TITLE,
  SEARCH_CATEGORY_PARAM,
  SEARCH_HREF,
  SEARCH_QUERY_PARAM,
  SUBJECT_CATEGORY_TYPE_NAME,
  SUBJECT_ICON_BY_NAME,
  SUBJECTS_LIMIT,
  SUBJECTS_SECTION_TITLE,
  TRENDING_LIMIT,
  TRENDING_SECTION_TITLE,
  UNTITLED_MATERIAL_LABEL,
  VIEW_ALL_LABEL,
} from "./page.constant";
import Button from "../components/Button/Button";
import EmptyState from "../components/EmptyState/EmptyState";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";
import Input from "../components/Input/Input";
import LoadingIndicator from "../components/LoadingIndicator/LoadingIndicator";
import { useCatalog } from "../hooks/api/useCatalog";
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

function HomePage() {
  const router = useRouter();
  const { data, isLoading, error } = useCatalog();
  const [heroQuery, setHeroQuery] = useState("");

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
      </div>
    </div>
  );
}

export default HomePage;
