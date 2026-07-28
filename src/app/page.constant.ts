// Constants for the StudyForGovt home / landing page.

// ---- Hero ----------------------------------------------------------------
export const HERO_EYEBROW = "For aspirants who show up every day";
export const HERO_TITLE_BEFORE = "Find the study material that gets you to the ";
export const HERO_TITLE_EMPHASIS = "interview call.";
export const HERO_SUBTITLE =
  "Notes, previous papers, and full test series for SSC, Railways, Banking, TSPSC, APPSC and other government exams — organised by exam, subject, and year. Free where it counts, paid where it's worth it.";
export const HERO_SEARCH_LABEL = "Keyword";
export const HERO_SEARCH_PLACEHOLDER =
  "e.g. Indian Polity, Quant shortcuts, GS 2024…";
export const HERO_SEARCH_SUBMIT_LABEL = "Search materials →";
export const HERO_SEARCH_INPUT_ID = "home-hero-search";
export const HERO_CATEGORY_LABEL = "Category";
export const HERO_CATEGORY_ALL = "All categories";
export const HERO_CATEGORY_SELECT_ID = "home-hero-category";
export const ADMIT_CARD_TAG = "Search Panel";
export const ADMIT_CARD_SERIAL = "REF NO. SFG-2026";

export const STAT_MATERIALS_LABEL = "Notes & PDFs";
export const STAT_CATEGORIES_LABEL = "Categories";
export const STAT_TESTS_LABEL = "Test series";

// ---- Section titles ------------------------------------------------------
export const TRENDING_EYEBROW = "From the catalog";
export const TRENDING_SECTION_TITLE = "Trending study material";
export const TRENDING_DESC =
  "What learners are browsing right now — organised for government exams.";
export const SUBJECTS_EYEBROW = "Browse by subject";
export const SUBJECTS_SECTION_TITLE = "Every exam, one shelf";
export const HOW_IT_WORKS_EYEBROW = "How it works";
export const HOW_IT_WORKS_TITLE = "From search to your desk in three steps";
export const HOW_IT_WORKS_STEPS = [
  {
    index: "STEP 01",
    title: "Search or browse",
    body: "Filter by exam, subject, or keyword using the search panel — no account needed to look around.",
  },
  {
    index: "STEP 02",
    title: "Preview before you commit",
    body: "Open a sample page or table of contents so you know exactly what you're getting.",
  },
  {
    index: "STEP 03",
    title: "Download or unlock",
    body: "Free material downloads instantly. Paid material unlocks after a one-time secure payment.",
  },
] as const;

export const CTA_TITLE =
  "Your next mock test score starts with today's notes.";
export const CTA_BODY =
  "Create a free account to track downloads and unlock paid materials for your exam.";
export const CTA_PRIMARY_LABEL = "Create free account";
export const CTA_SECONDARY_LABEL = "Browse catalog";
export const CTA_PRIMARY_HREF = "/account";
export const CTA_SECONDARY_HREF = "/search";

export const RECENTLY_ADDED_SECTION_TITLE = "Recently Added";
export const TEST_SERIES_SECTION_TITLE = "Test Series";
export const SECTIONAL_TESTS_SECTION_TITLE = "Sectional Tests";

// ---- Section limits ------------------------------------------------------
export const TRENDING_LIMIT = 6;
export const SUBJECTS_LIMIT = 10;
export const RECENTLY_ADDED_LIMIT = 3;

// ---- Actions / navigation ------------------------------------------------
export const VIEW_ALL_LABEL = "View all";
export const OPEN_MATERIAL_LABEL = "View";
export const SEARCH_HREF = "/search";
export const SEARCH_QUERY_PARAM = "q";
export const SEARCH_CATEGORY_PARAM = "categoryId";

export const UNTITLED_MATERIAL_LABEL = "Untitled material";
export const RECENTLY_ADDED_CAPTION = "Recently added";
export const SUBJECT_CATEGORY_TYPE_NAME = "Subject";
export const DEFAULT_EXAM_TAG = "Material";

export const CATALOG_EMPTY_TITLE = "No materials yet";
export const CATALOG_EMPTY_MESSAGE =
  "No study materials are available right now. Please check back later.";
export const CATALOG_ERROR_TITLE = "Couldn't load the catalog";
export const CATALOG_ERROR_MESSAGE =
  "The catalog could not be loaded. Please try again.";
export const CATALOG_LOADING_LABEL = "Loading catalog…";

export const TEST_LISTINGS_LOADING_LABEL = "Loading tests…";
export const TEST_LISTINGS_ERROR_TITLE = "Couldn't load tests";
export const TEST_LISTINGS_ERROR_MESSAGE =
  "The test listings could not be loaded. Please try again.";
export const TEST_SERIES_EMPTY_TITLE = "No test series yet";
export const TEST_SERIES_EMPTY_MESSAGE =
  "No test series are available right now. Please check back later.";
export const SECTIONAL_TESTS_EMPTY_TITLE = "No sectional tests yet";
export const SECTIONAL_TESTS_EMPTY_MESSAGE =
  "No sectional tests are available right now. Please check back later.";

export const BUY_LABEL = "Buy";
export const START_TEST_LABEL = "Start test";
export const FREE_STAMP_LABEL = "Free";
export const PAID_STAMP_LABEL = "Paid";

export const PURCHASE_SUCCESS_MESSAGE =
  "Payment successful. Your test is now unlocked.";
export const PURCHASE_FAILED_TITLE = "Purchase couldn't be completed";
export const PURCHASE_FAILED_FALLBACK =
  "The purchase could not be completed. Please try again.";
