// Type declarations for the `useTestListings` API-call hook (Req 6.1, 6.4, 6.7).
//
// The hook loads the Home Page Test Series and Sectional Tests listings from
// `GET /api/tests`. All type/interface declarations live here so the hook
// module stays free of type declarations (matching the `.types.ts` / `.ts`
// convention used across `hooks/api/`). The listing DTO shapes are reused from
// the shared client-side contract in `@/types/testSeries.types` so the client
// is strictly typed against the server response.

import type { HttpError } from '@/utils/http.types';
import type {
  SectionalTestListingDto,
  TestSeriesListingDto,
} from '@/types/testSeries.types';

/**
 * The state returned by {@link useTestListings} for the Home Page Test Series
 * and Sectional Tests sections (Req 6.1, 6.4, 6.7):
 *   - `testSeries`      every Test offered as a Test Series product (including
 *                       free Tests), in the deterministic order provided by the
 *                       server — never re-sorted (Req 6.1, 6.4).
 *   - `sectionalTests`  every Section offered as a Sectional Test product, in
 *                       the server-provided deterministic order (Req 6.1, 6.4).
 *   - `isLoading`       `true` while the request is in flight, driving the
 *                       loading indicator (Req 6.5).
 *   - `error`           the typed failure of the most recent request, or `null`
 *                       when the last request succeeded (Req 6.7).
 *
 * On failure, both listing arrays are empty so no partial or stale listings are
 * surfaced; the consumer renders the error message instead (Req 6.7).
 */
export interface TestListingsState {
  testSeries: TestSeriesListingDto[];
  sectionalTests: SectionalTestListingDto[];
  isLoading: boolean;
  error: HttpError | null;
}
