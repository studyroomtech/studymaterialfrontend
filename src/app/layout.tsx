import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../styles/globals.scss";
import styles from "./layout.module.scss";
import Navigation from "../components/Navigation/Navigation";
import ToastProvider from "../components/Toast/ToastProvider";
import GlobalProvider from "../context/global-context/provider";
import { isMobile } from "../utils/browser";

// Provided as a function (not a const-literal export) so the metadata object
// literal is not authored outside a *.constant.ts file (Requirements 1.16, 1.17).
export function generateMetadata(): Metadata {
  return {
    title: "Study Materials Platform",
    description:
      "Browse, search, view, and download study materials organized by a multi-dimensional category system.",
  };
}

// The root layout renders the primary navigation (links to the Material Catalog
// and search) above every page so those controls are present on every primary
// page (Req 7.6), then hosts the routed page inside a shared content region.
async function RootLayout({ children }: { children: ReactNode }) {
  // Detect a mobile client from the request User-Agent so the global context
  // has an SSR-safe screen default before the client can measure the viewport.
  const initialIsMobile = await isMobile();

  return (
    <html lang="en">
      <body>
        <GlobalProvider initialIsMobile={initialIsMobile}>
          <ToastProvider>
            <div className={styles.shell}>
              <Navigation />
              <main className={styles.content}>{children}</main>
            </div>
          </ToastProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}

export default RootLayout;
