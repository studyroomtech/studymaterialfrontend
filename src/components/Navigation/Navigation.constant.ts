// Constants for the Navigation component — StudyForGovt.

export const NAV_BRAND_LABEL = "StudyForGovt";
export const NAV_BRAND_MARK = "S";

export const NAV_LINKS = [
  { label: "Catalog", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Paid Library", href: "/paid" },
  { label: "Account", href: "/account" },
] as const;

export const ADMIN_NAV_LINK = { label: "Manage", href: "/admin/dashboard" } as const;

export const CART_NAV_LINK = { label: "Cart", href: "/cart" } as const;
