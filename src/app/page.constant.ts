// Constants for the home / Material Catalog landing page (Requirement 1.16).
//
// Centralizes the page's user-facing copy, section limits, and the subject-tile
// icon map so the page module stays free of constant-literal declarations.

// ---- Hero ----------------------------------------------------------------
export const HERO_TITLE = "Find the study resources you need";
export const HERO_SUBTITLE =
  "Browse notes, guides, and past papers across every subject — all in one place.";
export const HERO_SEARCH_LABEL = "Search study resources";
export const HERO_SEARCH_PLACEHOLDER = "Search study resources…";
export const HERO_SEARCH_SUBMIT_LABEL = "Search";
export const HERO_SEARCH_INPUT_ID = "home-hero-search";
// Decorative emoji shown in the hero artwork (purely presentational).
export const HERO_ART_ICON = "📚";

// ---- Section titles ------------------------------------------------------
export const TRENDING_SECTION_TITLE = "Trending Study Materials";
export const SUBJECTS_SECTION_TITLE = "Subjects";
export const RECENTLY_ADDED_SECTION_TITLE = "Recently Added";

// ---- Section limits ------------------------------------------------------
export const TRENDING_LIMIT = 3;
export const SUBJECTS_LIMIT = 8;
export const RECENTLY_ADDED_LIMIT = 3;

// ---- Actions / navigation ------------------------------------------------
export const VIEW_ALL_LABEL = "View all";
export const OPEN_MATERIAL_LABEL = "Open";
export const SEARCH_HREF = "/search";
// URL query parameters understood by the search page.
export const SEARCH_QUERY_PARAM = "q";
export const SEARCH_CATEGORY_PARAM = "categoryId";

// ---- Icons / fallbacks ---------------------------------------------------
// Decorative emoji shown on each Study Material card (presentational only).
export const MATERIAL_ICON = "📄";
// Fallback title shown for a Study Material that has no title.
export const UNTITLED_MATERIAL_LABEL = "Untitled material";
// Recently-added helper caption (no upload date is exposed by the API).
export const RECENTLY_ADDED_CAPTION = "Recently added";

// The Category Type whose categories are surfaced as the "Subjects" tiles.
export const SUBJECT_CATEGORY_TYPE_NAME = "Subject";

// Emoji icon chosen per subject name (case-insensitive). Falls back to
// DEFAULT_SUBJECT_ICON when a subject has no specific match.
export const SUBJECT_ICON_BY_NAME: Record<string, string> = {
  math: "➗",
  maths: "➗",
  mathematics: "➗",
  science: "🔬",
  physics: "⚛️",
  chemistry: "🧪",
  biology: "🧬",
  history: "🏛️",
  geography: "🌍",
  literature: "📖",
  english: "✍️",
  language: "🗣️",
  computer: "💻",
  "computer science": "💻",
  economics: "📈",
  business: "💼",
  art: "🎨",
  music: "🎵",
  law: "⚖️",
  medicine: "🩺",
  other: "📘",
  others: "📘",
};
export const DEFAULT_SUBJECT_ICON = "📘";

// ---- Loading / empty / error copy ---------------------------------------
export const CATALOG_EMPTY_TITLE = "No materials yet";
export const CATALOG_EMPTY_MESSAGE =
  "No study materials are available right now. Please check back later.";
export const CATALOG_ERROR_TITLE = "Couldn't load the catalog";
export const CATALOG_ERROR_MESSAGE =
  "The catalog could not be loaded. Please try again.";
export const CATALOG_LOADING_LABEL = "Loading catalog…";
