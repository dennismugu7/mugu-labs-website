import type { Metadata } from "next";
import { site } from "./site";

/**
 * The share-card fields every page starts from. A page that sets its own
 * openGraph or twitter replaces the layout's object outright (Next does not
 * deep-merge them), so pages spread these in and override what differs.
 */

/** Rendered by scripts/og-image.mjs from the built site; re-run after a
    change to the mark, the gradient or the hero line. */
export const shareImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

export const defaultTitle = `${site.name} — ${site.tagline}`;

export const baseOpenGraph = {
  type: "website",
  url: site.url,
  siteName: site.name,
  title: defaultTitle,
  description: site.description,
  images: [shareImage],
} satisfies Metadata["openGraph"];

export const baseTwitter = {
  card: "summary_large_image",
  title: defaultTitle,
  description: site.description,
  images: [shareImage],
} satisfies Metadata["twitter"];
