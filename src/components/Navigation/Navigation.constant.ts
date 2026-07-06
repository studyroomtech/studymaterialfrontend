// Constants for the Navigation component (Requirement 1.16).
//
// The primary navigation links shown on every primary page (Req 7.6): the
// Material Catalog (home) and search. Centralized here so the labels and hrefs
// have a single source of truth.

// The brand/wordmark shown in the navigation bar, linking back to the Catalog.
export const NAV_BRAND_LABEL = "Study Materials";

// The primary navigation destinations rendered on every primary page (Req 7.6).
//   - Catalog -> "/"        the Material Catalog home (Req 3.1)
//   - Search  -> "/search"  search and filter (Req 4.1)
//   - Paid    -> "/paid"    the Paid Materials Tab (Req 12.1)
//   - Account -> "/account" name + email sign-in / sign-out
export const NAV_LINKS = [
  { label: "Catalog", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Paid", href: "/paid" },
  { label: "Account", href: "/account" },
] as const;

// Admin-only navigation destination, shown to a signed-in user whose token
// holds `role_admin`. Points at the content-management dashboard where an
// admin adds/edits study materials and manages categories (Req 10.4, 11).
export const ADMIN_NAV_LINK = { label: "Manage", href: "/admin/dashboard" } as const;
