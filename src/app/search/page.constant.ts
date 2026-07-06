// Constant values for the Search page (Requirements 4.1–4.5, 1.16, 1.17).
//
// The Search page lets a Learner search Study Materials by title/tag and filter
// by Category, rendering the filtered results or a "no matching materials"
// message. These literals are defined here so the page module stays free of
// constant-literal exports (Req 1.16, 1.17).

/** Page heading and supporting copy. */
export const SEARCH_PAGE_TITLE = "Search study materials";
export const SEARCH_PAGE_SUBTITLE =
  "Find materials by title or tag, and narrow results by category.";

/** Search text input (Req 4.1). */
export const SEARCH_INPUT_ID = "material-search";
export const SEARCH_INPUT_LABEL = "Search study materials";
export const SEARCH_INPUT_PLACEHOLDER = "Search by title or tag";
/** Upper bound on the query length accepted by the input (Req 4.1: 1–100). */
export const SEARCH_INPUT_MAX_LENGTH = 100;

/** Category filter select (Req 4.2). */
export const CATEGORY_FILTER_ID = "category-filter";
export const CATEGORY_FILTER_LABEL = "Filter by category";
/** Value/label of the option that clears the Category filter (Req 4.3, 4.4). */
export const ALL_CATEGORIES_VALUE = "";
export const ALL_CATEGORIES_LABEL = "All categories";

/** Loading affordance shown while results are fetched (Req 7.3). */
export const SEARCH_LOADING_LABEL = "Searching materials…";

/** Error copy shown when the search request fails or times out (Req 8.1, 8.2). */
export const SEARCH_ERROR_TITLE = "Search unavailable";
export const SEARCH_ERROR_MESSAGE =
  "The materials could not be loaded. Please try again.";

/** Accessible label for the rendered results region. */
export const SEARCH_RESULTS_LABEL = "Search results";
