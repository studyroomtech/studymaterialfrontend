'use client';

// `useSearchMaterials` — search/filter Study Materials via
// `GET /api/materials/search?q=&categoryId=`.
//
// Returns `{ data, isLoading, error }`. The query is trimmed before being sent;
// an empty/whitespace query is omitted so the Backend API returns all materials
// (Req 4.1, 4.3). An optional `categoryId` applies a Category filter, and both
// together intersect (Req 4.2, 4.4). Failures/timeouts are surfaced as an error
// while the previous results remain available to preserve the view (Req 8.1).

import { useMemo } from 'react';

import { buildApiUrl } from './apiClient';
import { API_ROUTES, SEARCH_QUERY_PARAMS } from './apiClient.constant';
import type {
  AsyncState,
  SearchMaterialsResult,
  UseSearchMaterialsParams,
} from './apiHooks.types';
import { useApiResource } from './useApiResource';

export const useSearchMaterials = ({
  query,
  categoryId,
}: UseSearchMaterialsParams): AsyncState<SearchMaterialsResult> => {
  // Recompute the request URL only when the trimmed query or filter changes so
  // the underlying fetch effect is not re-run on unrelated re-renders.
  const url = useMemo(() => {
    const trimmedQuery = query.trim();
    return buildApiUrl(API_ROUTES.materialsSearch, {
      [SEARCH_QUERY_PARAMS.query]: trimmedQuery.length > 0 ? trimmedQuery : undefined,
      [SEARCH_QUERY_PARAMS.categoryId]: categoryId,
    });
  }, [query, categoryId]);

  return useApiResource<SearchMaterialsResult>(url);
};
