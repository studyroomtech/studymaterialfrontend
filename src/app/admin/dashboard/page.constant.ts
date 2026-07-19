// Admin dashboard Manage Page tab constants (Requirements 1.1, 1.2, 1.3, 1.4).
//
// Value-only declarations for the two-tab Manage Page switch: the tab
// identifiers and their user-facing labels. Types live in `page.types.ts`.

import type { ManageTabId } from './page.types';

/** The Study Material Tab, active by default when the Manage Page loads (Req 1.1). */
export const STUDY_MATERIAL_TAB: ManageTabId = 'study-material';

/** The Test Series Tab, added by this feature (Req 1.3). */
export const TEST_SERIES_TAB: ManageTabId = 'test-series';

/** The tab active on first load (Req 1.1). */
export const DEFAULT_TAB: ManageTabId = STUDY_MATERIAL_TAB;

/** User-facing label for the Study Material Tab. */
export const STUDY_MATERIAL_TAB_LABEL = 'Study Material';

/** User-facing label for the Test Series Tab. */
export const TEST_SERIES_TAB_LABEL = 'Test Series';

/** Accessible label for the tab list. */
export const TABS_ARIA_LABEL = 'Manage content';
