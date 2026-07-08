// Footer component.
//
// Renders the site footer shown on the home page over a dark band:
//   - a top row with the YouTube channel link and support email;
//   - a centered inspirational quote;
//   - a bottom brand row with a book-and-rays logo and wordmark, flanked by
//     horizontal rules.
// External links open in a new tab with safe `rel` attributes. Styling is
// authored entirely in `Footer.module.scss` (no inline CSS, Req 1.19).

import styles from "./Footer.module.scss";
import {
  BRAND_LOGO_LABEL,
  BRAND_NAME,
  FOOTER_QUOTE,
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  SUPPORT_PREFIX,
  YOUTUBE_LABEL,
  YOUTUBE_PREFIX,
  YOUTUBE_URL,
} from "./Footer.constant";
import type { FooterProps } from "./Footer.types";

/** Book-with-rays brand mark; decorative since the wordmark carries the label. */
function BrandLogo() {
  return (
    <svg
      className={styles.logo}
      viewBox="0 0 48 40"
      role="img"
      aria-label={BRAND_LOGO_LABEL}
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {/* Radiating sunrise lines above the book. */}
        <line x1="24" y1="2" x2="24" y2="9" />
        <line x1="15" y1="4" x2="17.5" y2="10" />
        <line x1="33" y1="4" x2="30.5" y2="10" />
        <line x1="8" y1="9" x2="12" y2="13.5" />
        <line x1="40" y1="9" x2="36" y2="13.5" />
      </g>
      {/* Open book. */}
      <path
        fill="currentColor"
        d="M24 17.5c-3.4-2.4-7.6-3.2-11.8-2.6-.7.1-1.2.7-1.2 1.4v16c0 .9.8 1.6 1.7 1.4 3.7-.6 7.5.1 10.6 2.1.4.3 1 .3 1.4 0 3.1-2 6.9-2.7 10.6-2.1.9.1 1.7-.5 1.7-1.4v-16c0-.7-.5-1.3-1.2-1.4-4.2-.6-8.4.2-11.8 2.6Zm-1.5 15.7c-2.7-1.4-5.7-2-8.7-1.8V17.9c3-.3 6 .4 8.7 1.9v13.4Zm12 -1.8c-3 -.2 -6 .4 -8.7 1.8V19.8c2.7-1.5 5.7-2.2 8.7-1.9v13.5Z"
      />
    </svg>
  );
}

function Footer({ className }: FooterProps) {
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <footer className={rootClassName}>
      <div className={styles.inner}>
        <div className={styles.contact}>
          <span className={styles.contactItem}>
            <span className={styles.contactPrefix}>{YOUTUBE_PREFIX}</span>{" "}
            <a
              className={styles.contactLink}
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={YOUTUBE_LABEL}
            >
              {YOUTUBE_URL}
            </a>
          </span>
          <span className={styles.contactItem}>
            <span className={styles.contactPrefix}>{SUPPORT_PREFIX}</span>{" "}
            <a className={styles.contactLink} href={SUPPORT_MAILTO}>
              {SUPPORT_EMAIL}
            </a>
          </span>
        </div>

        <hr className={styles.rule} />

        <p className={styles.quote}>{FOOTER_QUOTE}</p>

        <div className={styles.brand}>
          <span className={styles.brandRule} aria-hidden="true" />
          <span className={styles.brandMark}>
            <BrandLogo />
            <span className={styles.brandName}>{BRAND_NAME}</span>
          </span>
          <span className={styles.brandRule} aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
