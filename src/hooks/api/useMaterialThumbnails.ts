'use client';
// `useMaterialThumbnails` — a material's public thumbnail images from
// `GET /api/materials/:id/thumbnails`. Not entitlement-gated, so the locked
// preview page can show the images before purchase. `null` skips the request.
import { buildApiUrl } from './apiClient';
import { API_ROUTES, MATERIAL_THUMBNAILS_ACTION } from './apiClient.constant';
import type { AsyncState, MaterialThumbnailsResult } from './apiHooks.types';
import { useApiResource } from './useApiResource';

export const useMaterialThumbnails = (
  materialId: string | null,
): AsyncState<MaterialThumbnailsResult> => {
  const url =
    materialId !== null && materialId.length > 0
      ? buildApiUrl(
          `${API_ROUTES.material}/${encodeURIComponent(materialId)}/${MATERIAL_THUMBNAILS_ACTION}`,
        )
      : null;
  return useApiResource<MaterialThumbnailsResult>(url);
};
