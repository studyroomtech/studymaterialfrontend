'use client';

// `useMaterial` — load one Study Material's metadata from
// `GET /api/materials/:id`.
//
// Returns `{ data, isLoading, error }` so the view page can show a loading
// indicator while the content is retrieved (Req 5.1, 5.2). A tighter 5s timeout
// is applied per Req 5.5 so a slow or failed request surfaces an error without
// displaying partial content; the previous material remains available so the
// current view is preserved on failure (Req 8.1). Passing an empty/`null` id
// skips fetching and leaves the hook idle.

import { buildApiUrl } from './apiClient';
import { API_ROUTES, MATERIAL_REQUEST_TIMEOUT_MS } from './apiClient.constant';
import type { AsyncState, MaterialDetail } from './apiHooks.types';
import { useApiResource } from './useApiResource';

export const useMaterial = (
  materialId: string | null,
): AsyncState<MaterialDetail> => {
  const url =
    materialId !== null && materialId.length > 0
      ? buildApiUrl(`${API_ROUTES.material}/${encodeURIComponent(materialId)}`)
      : null;

  return useApiResource<MaterialDetail>(url, {
    timeoutMs: MATERIAL_REQUEST_TIMEOUT_MS,
  });
};
