import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";
import Backdrop from "../components/Backdrop";
import Motion from "../components/Motion";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { site } from "../lib/site";

/** Rendered by scripts/og-image.mjs from the built site; re-run after a
    change to the mark, the gradient or the hero line. */
const shareImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.githubUrl }],
  creator: site.author.name,
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [shareImage],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#010724",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="no-js">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <Backdrop />
        <Nav />

        <main id="main">{children}</main>

        <Footer />
        <Motion />
      </body>
    </html>
  );
}
