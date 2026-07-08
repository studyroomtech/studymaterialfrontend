// Navigation component (Requirement 7.6).
//
// Renders the primary navigation controls linking to the Material Catalog and
// to search. It is mounted by the App Router root layout so the same controls
// appear on every primary page. The currently active destination is marked via
// `aria-current` so the navigation is accessible. Styling is authored entirely
// in `Navigation.module.scss` (no inline CSS, Req 1.19).

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAccessToken } from "../../hooks/useAccessToken";
import { useCart } from "../../hooks/useCart";
import styles from "./Navigation.module.scss";
import {
  ADMIN_NAV_LINK,
  CART_NAV_LINK,
  NAV_BRAND_LABEL,
  NAV_LINKS,
} from "./Navigation.constant";
import type { NavigationProps } from "./Navigation.types";

/**
 * Determine whether a nav link is the active destination for the current path.
 * The Catalog root ("/") matches only an exact path; other links match their
 * path or any nested route beneath it.
 */
function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Navigation({ className }: NavigationProps) {
  const pathname = usePathname() ?? "/";
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  const { isAdmin } = useAccessToken();
  const { count: cartCount } = useCart();
  // Only reflect admin state after mount so the server-rendered markup (which
  // has no access to the stored token) matches the initial client render,
  // avoiding a hydration mismatch; the Manage link then appears for admins.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const links =
    hasMounted && isAdmin ? [...NAV_LINKS, ADMIN_NAV_LINK] : NAV_LINKS;

  return (
    <header className={rootClassName}>
      <nav className={styles.bar} aria-label="Primary">
        <Link href="/" className={styles.brand}>
          {NAV_BRAND_LABEL}
        </Link>
        <ul className={styles.links}>
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <li key={link.href} className={styles.item}>
                <Link
                  href={link.href}
                  className={active ? `${styles.link} ${styles.active}` : styles.link}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li className={styles.item}>
            <Link
              href={CART_NAV_LINK.href}
              className={
                isActivePath(pathname, CART_NAV_LINK.href)
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
              aria-current={
                isActivePath(pathname, CART_NAV_LINK.href) ? "page" : undefined
              }
            >
              {CART_NAV_LINK.label}
              {hasMounted && cartCount > 0 ? (
                <span className={styles.badge} aria-label={`${cartCount} items in cart`}>
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navigation;
