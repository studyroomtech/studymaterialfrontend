'use client';

// `useUnlockOptions` — list the Paid Materials whose purchase unlocks a locked
// material through its Link Group, from `GET /api/materials/:id/unlock-options`
// (linked-material-entitlement).
//
// Used by the locked-material panel: when a Free Material is locked because it
// shares a Link Group with a Paid Material, the Learner cannot pay for the free
// note itself — this hook surfaces the paid note(s) they can buy instead, which
// the panel renders as links to those notes' pages. Passing `null` skips the
// request (e.g. before the locked material id is known).

import { buildApiUrl } from './apiClient';
import {
  API_ROUTES,
  MATERIAL_UNLOCK_OPTIONS_ACTION,
} from './apiClient.constant';
import type { AsyncState } from './apiHooks.types';
import type { UnlockOptionsResult } from './useUnlockOptions.types';
import { useApiResource } from './useApiResource';
import { useAccessToken } from '../useAccessToken';

export const useUnlockOptions = (
  materialId: string | null,
): AsyncState<UnlockOptionsResult> => {
  const { token } = useAccessToken();
  const url =
    materialId !== null && materialId.length > 0
      ? buildApiUrl(
          `${API_ROUTES.material}/${encodeURIComponent(materialId)}/${MATERIAL_UNLOCK_OPTIONS_ACTION}`,
        )
      : null;
  return useApiResource<UnlockOptionsResult>(url, { authToken: token });
};
