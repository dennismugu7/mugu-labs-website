import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";
import Backdrop from "../components/Backdrop";
import Motion from "../components/Motion";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { blogVisible } from "../lib/blog";
import { baseOpenGraph, baseTwitter, defaultTitle } from "../lib/metadata";
import { motionBootScript } from "../lib/motion";
import { site } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  /* Three hostnames serve this content (the apex, www, the Vercel alias);
     this is the one search engines should index. Relative, resolved against
     metadataBase. Pages with their own URL set their own (products). */
  alternates: { canonical: "/" },
  title: {
    default: defaultTitle,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.githubUrl }],
  creator: site.author.name,
  openGraph: baseOpenGraph,
  twitter: baseTwitter,
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
    // The boot script adds a class to <html> before React hydrates it.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <Backdrop />
        <Nav showBlog={blogVisible()} />

        <main id="main">{children}</main>

        <Footer />
        <Motion />
      </body>
    </html>
  );
}
