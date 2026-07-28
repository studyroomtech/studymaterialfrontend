// Footer component — StudyForGovt.

import Link from "next/link";

import styles from "./Footer.module.scss";
import {
  ACCOUNT_LINKS,
  BRAND_MARK,
  BRAND_NAME,
  BRAND_TAGLINE,
  COPYRIGHT_LABEL,
  EXPLORE_LINKS,
  FOOTER_QUOTE,
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  YOUTUBE_LABEL,
  YOUTUBE_URL,
} from "./Footer.constant";
import type { FooterProps } from "./Footer.types";

function Footer({ className }: FooterProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <footer className={rootClassName}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brand}>
              <span className={styles.logoMark} aria-hidden="true">
                {BRAND_MARK}
              </span>
              {BRAND_NAME}
            </div>
            <p className={styles.tagline}>{BRAND_TAGLINE}</p>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Explore</h4>
            {EXPLORE_LINKS.map((link) => (
              <Link key={link.href + link.label} href={link.href} className={styles.colLink}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Account</h4>
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.href + link.label} href={link.href} className={styles.colLink}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Support</h4>
            <a className={styles.colLink} href={SUPPORT_MAILTO}>
              {SUPPORT_EMAIL}
            </a>
            <a
              className={styles.colLink}
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {YOUTUBE_LABEL}
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>{COPYRIGHT_LABEL}</span>
          <span className={styles.quote}>{FOOTER_QUOTE}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
