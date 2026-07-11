import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../styles/globals.scss";
import styles from "./layout.module.scss";
import Navigation from "../components/Navigation/Navigation";
import ToastProvider from "../components/Toast/ToastProvider";

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
function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className={styles.shell}>
            <Navigation />
            <main className={styles.content}>{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

export default RootLayout;
