// Search page (Requirements 4.1–4.5).
//
// Lets a Learner search Study Materials and filter by Category:
//   - A debounced search box (via `useDebounce`) sends the trimmed query to the
//     Backend API; matching is by title or Tag name (Req 4.1). An empty/
//     whitespace query returns all materials (Req 4.3).
//   - A Category filter restricts results to the selected Category (Req 4.2);
//     when both a query and a filter are active the results satisfy both
//     (Req 4.4). The Category options come from the Material Catalog.
//   - Results are rendered as a list; when the search matches nothing, all
//     materials are hidden and a "no matching materials" message is shown
//     (Req 4.5). Loading and error/timeout states are surfaced without wiping
//     the controls or the current results (Req 7.3, 8.1, 8.2).
//
// The actual search/filter is performed server-side by `useSearchMaterials`;
// this page is a thin, accessible rendering layer. All styling lives in
// `page.module.scss` (no inline CSS, Req 1.19).

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import EmptyState from "@/components/EmptyState/EmptyState";
import { NO_MATCHING_MATERIALS_MESSAGE } from "@/components/EmptyState/EmptyState.constant";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import Input from "@/components/Input/Input";
import LoadingIndicator from "@/components/LoadingIndicator/LoadingIndicator";
import RatingBadge from "@/components/RatingBadge/RatingBadge";
import {
  MaterialCoverArt,
  coverVariantLabel,
  resolveCoverVariant,
} from "@/components/MaterialCoverArt/MaterialCoverArt";
import { useCatalog } from "@/hooks/api/useCatalog";
import { useSearchMaterials } from "@/hooks/api/useSearchMaterials";
import { useDebounce } from "@/hooks/useDebounce";

import styles from "./page.module.scss";
import {
  ALL_CATEGORIES_LABEL,
  ALL_CATEGORIES_VALUE,
  CATEGORY_FILTER_ID,
  CATEGORY_FILTER_LABEL,
  DEFAULT_RESULT_TAG,
  SEARCH_ERROR_MESSAGE,
  SEARCH_ERROR_TITLE,
  SEARCH_INPUT_ID,
  SEARCH_INPUT_LABEL,
  SEARCH_INPUT_MAX_LENGTH,
  SEARCH_INPUT_PLACEHOLDER,
  SEARCH_LOADING_LABEL,
  SEARCH_PAGE_SUBTITLE,
  SEARCH_PAGE_TITLE,
  SEARCH_RESULTS_LABEL,
  VIEW_MATERIAL_LABEL,
} from "./page.constant";

function firstTagName(
  tagsByCategoryType: Record<string, Array<{ categoryId: string; name: string }>>,
): string {
  for (const tags of Object.values(tagsByCategoryType)) {
    if (tags.length > 0 && tags[0].name.trim().length > 0) {
      return tags[0].name;
    }
  }
  return DEFAULT_RESULT_TAG;
}

function SearchPage() {
  // Raw query drives the input; the debounced copy drives the request so the
  // search runs after the Learner stops typing (Req 4.1).
  const [query, setQuery] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(ALL_CATEGORIES_VALUE);
  const debouncedQuery = useDebounce(query);

  // Seed the query and Category filter from the URL (`?q=` / `?categoryId=`) on
  // mount, so deep links from the home page (hero search, subject tiles) arrive
  // pre-filtered. Read client-side to avoid a Suspense boundary requirement.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    const initialCategoryId = params.get("categoryId");
    if (initialQuery) {
      setQuery(initialQuery);
    }
    if (initialCategoryId) {
      setCategoryId(initialCategoryId);
    }
  }, []);

  // Category filter options are sourced from the Material Catalog structure.
  const catalog = useCatalog();
  const categoryTypes = catalog.data?.categoryTypes ?? [];

  const {
    data: results,
    isLoading,
    error,
  } = useSearchMaterials({
    query: debouncedQuery,
    // An empty selection clears the Category filter (Req 4.3, 4.4).
    categoryId: categoryId.length > 0 ? categoryId : undefined,
  });

  const materials = useMemo(() => results?.materials ?? [], [results]);

  // Only replace the whole panel with the loading/error affordance before the
  // first successful load; afterwards keep the current results visible while a
  // new request runs or fails, preserving the view (Req 3.9, 8.1).
  const showLoadingPanel = isLoading && results === null;
  const showErrorPanel = error !== null && results === null;
  const showInlineError = error !== null && results !== null;
  const showEmpty = results !== null && error === null && materials.length === 0;
  const showResults = materials.length > 0;

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <header className={styles.header}>
          <h1 className={styles.title}>{SEARCH_PAGE_TITLE}</h1>
          <p className={styles.subtitle}>{SEARCH_PAGE_SUBTITLE}</p>
        </header>

        <div className={styles.controlsCard}>
          <Input
            id={SEARCH_INPUT_ID}
            className={styles.searchInput}
            label={SEARCH_INPUT_LABEL}
            type="search"
            placeholder={SEARCH_INPUT_PLACEHOLDER}
            maxLength={SEARCH_INPUT_MAX_LENGTH}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className={styles.filter}>
            <label className={styles.filterLabel} htmlFor={CATEGORY_FILTER_ID}>
              {CATEGORY_FILTER_LABEL}
            </label>
            <select
              id={CATEGORY_FILTER_ID}
              className={styles.filterSelect}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value={ALL_CATEGORIES_VALUE}>
                {ALL_CATEGORIES_LABEL}
              </option>
              {categoryTypes.map((categoryType) => (
                <optgroup key={categoryType.id} label={categoryType.name}>
                  {categoryType.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={styles.results} aria-label={SEARCH_RESULTS_LABEL}>
        {showLoadingPanel && (
          <LoadingIndicator fullPanel label={SEARCH_LOADING_LABEL} />
        )}

        {(showErrorPanel || showInlineError) && (
          <ErrorMessage
            title={SEARCH_ERROR_TITLE}
            message={SEARCH_ERROR_MESSAGE}
          />
        )}

        {showEmpty && <EmptyState message={NO_MATCHING_MATERIALS_MESSAGE} />}

        {showResults && (
          <ul className={styles.resultGrid}>
            {materials.map((material) => {
              const tags = Object.values(material.tagsByCategoryType).flat();
              const primaryTag = firstTagName(material.tagsByCategoryType);
              const coverVariant = resolveCoverVariant(material.id);
              return (
                <li key={material.id} className={styles.resultItem}>
                  <Link
                    className={styles.resultCard}
                    href={`/materials/${material.id}`}
                  >
                    <div className={styles.resultCover}>
                      <MaterialCoverArt
                        variant={coverVariant}
                        uid={`search-${material.id}`}
                        className={styles.resultCoverArt}
                      />
                      <span className={styles.coverBadge}>
                        {coverVariantLabel(coverVariant)}
                      </span>
                    </div>
                    <div className={styles.resultBody}>
                      {tags.length > 0 ? (
                        <span className={styles.examTag}>{primaryTag}</span>
                      ) : null}
                      <span className={styles.resultTitle}>
                        {material.title}
                      </span>
                      <RatingBadge
                        averageRating={material.averageRating}
                        reviewCount={material.reviewCount}
                      />
                      {material.description ? (
                        <span className={styles.resultDescription}>
                          {material.description}
                        </span>
                      ) : null}
                      {tags.length > 1 ? (
                        <span className={styles.tagList}>
                          {tags.slice(1).map((tag) => (
                            <span key={tag.categoryId} className={styles.tag}>
                              {tag.name}
                            </span>
                          ))}
                        </span>
                      ) : null}
                      <span className={styles.resultFoot}>
                        {VIEW_MATERIAL_LABEL} →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default SearchPage;
