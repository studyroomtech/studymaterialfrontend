'use client';

// `useCatalog` — load the Material Catalog structure from `GET /api/catalog`.
//
// Returns `{ data, isLoading, error }` so the catalog page can render a loading
// indicator while the structure is fetched (Req 3.1, 7.3) and an error message
// while preserving the current view when the request fails or times out
// (Req 3.9, 8.1, 8.2).

import { buildApiUrl } from './apiClient';
import { API_ROUTES } from './apiClient.constant';
import type { AsyncState, CatalogData } from './apiHooks.types';
import { useApiResource } from './useApiResource';

export const useCatalog = (): AsyncState<CatalogData> => {
  return useApiResource<CatalogData>(buildApiUrl(API_ROUTES.catalog));
};
