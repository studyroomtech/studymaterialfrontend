// Backend API URL helpers shared by the API-call hooks (`hooks/api/`).
//
// The Backend API base URL is supplied through the `NEXT_PUBLIC_API_BASE_URL`
// environment variable rather than hardcoded, so the Frontend Project can be
// pointed at different backends per environment without code changes. These
// helpers build absolute request URLs from the route paths in
// `apiClient.constant.ts`; the hooks then fetch them via `utils/http.ts`.

/**
 * Resolve the configured Backend API base URL from the environment, with any
 * trailing slashes removed. Returns an empty string when unset so requests fall
 * back to a relative (same-origin) URL.
 */
function resolveApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  return base.replace(/\/+$/, '');
}

/**
 * Serialize a set of query parameters into a leading-`?` query string,
 * omitting entries whose value is `undefined` or empty after trimming.
 * Returns an empty string when no parameters remain.
 */
function buildQueryString(
  params?: Record<string, string | undefined>,
): string {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value.trim().length > 0) {
      search.set(key, value);
    }
  }
  const serialized = search.toString();
  return serialized.length > 0 ? `?${serialized}` : '';
}

/**
 * Build an absolute Backend API request URL from a route `path` and optional
 * query parameters, using the environment-configured base URL.
 */
export function buildApiUrl(
  path: string,
  params?: Record<string, string | undefined>,
): string {
  return `${resolveApiBaseUrl()}${path}${buildQueryString(params)}`;
}
