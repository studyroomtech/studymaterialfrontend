// Navigation component — StudyForGovt.

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
  NAV_BRAND_MARK,
  NAV_LINKS,
} from "./Navigation.constant";
import type { NavigationProps } from "./Navigation.types";

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.45-1.1L21 8H7" />
    </svg>
  );
}

function Navigation({ className }: NavigationProps) {
  const pathname = usePathname() ?? "/";
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  const { isAdmin } = useAccessToken();
  const { count: cartCount } = useCart();
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
          <span className={styles.logoMark} aria-hidden="true">
            {NAV_BRAND_MARK}
          </span>
          {NAV_BRAND_LABEL}
        </Link>
        <ul className={styles.links}>
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <li key={link.href} className={styles.item}>
                <Link
                  href={link.href}
                  className={
                    active ? `${styles.link} ${styles.active}` : styles.link
                  }
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
                  ? `${styles.cartLink} ${styles.active}`
                  : styles.cartLink
              }
              aria-label={CART_NAV_LINK.label}
              aria-current={
                isActivePath(pathname, CART_NAV_LINK.href) ? "page" : undefined
              }
            >
              <CartIcon />
              {hasMounted && cartCount > 0 ? (
                <span
                  className={styles.badge}
                  aria-label={`${cartCount} items in cart`}
                >
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
