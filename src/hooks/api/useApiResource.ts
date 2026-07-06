'use client';

// Generic Backend API resource hook shared by the API-call hooks.
//
// Given a fully-built request URL (or `null` to skip fetching), this hook
// fetches JSON via the shared `utils/http.ts` wrapper and exposes the common
// `{ data, isLoading, error }` state (Req 7.3, 8.1). Key behaviors:
//   - Loading is surfaced immediately so indicators can appear (Req 7.3, 5.2).
//   - Failures (network, timeout, or API error) are surfaced as a typed error
//     WITHOUT clearing the last successful `data`, so callers can preserve the
//     current view on failure (Req 3.9, 8.1).
//   - The 30s timeout of `utils/http.ts` (Req 8.2) can be overridden per call
//     (e.g. the 5s material-view budget, Req 5.5).
//   - In-flight requests are aborted when the URL changes or the component
//     unmounts, and their (ignored) results never update state.

import { useEffect, useState } from 'react';

import { httpRequest } from '@/utils/http';
import type { HttpError } from '@/utils/http.types';

import type { AsyncState, UseApiResourceOptions } from './apiHooks.types';

export const useApiResource = <TData>(
  url: string | null,
  options: UseApiResourceOptions = {},
): AsyncState<TData> => {
  const { timeoutMs } = options;

  const [data, setData] = useState<TData | null>(null);
  // Begin in the loading state whenever there is a URL to fetch so a loading
  // indicator can render before the first response (Req 7.3).
  const [isLoading, setIsLoading] = useState<boolean>(url !== null);
  const [error, setError] = useState<HttpError | null>(null);

  useEffect(() => {
    if (url === null) {
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    // Clear any prior error for the new attempt, but keep the previous `data`
    // visible until this request succeeds (Req 3.9, 8.1).
    setError(null);

    httpRequest<TData>(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      timeoutMs,
    }).then((result) => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setData(result.data);
        setError(null);
      } else {
        // Preserve the last successful `data`; only surface the error so the
        // caller can show a message while keeping the current view (Req 8.1).
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [url, timeoutMs]);

  return { data, isLoading, error };
};
