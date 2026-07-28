import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import "../styles/globals.scss";
import styles from "./layout.module.scss";
import Navigation from "../components/Navigation/Navigation";
import ToastProvider from "../components/Toast/ToastProvider";
import GlobalProvider from "../context/global-context/provider";
import { isMobile } from "../utils/browser";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export function generateMetadata(): Metadata {
  return {
    title: "StudyForGovt — Government Exam Study Materials",
    description:
      "Notes, previous papers, and test series for SSC, Railways, Banking, TSPSC, APPSC and other government exams — free and paid.",
  };
}

async function RootLayout({ children }: { children: ReactNode }) {
  const initialIsMobile = await isMobile();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className={ibmPlexSans.className}>
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
