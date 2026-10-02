import type { NextConfig } from "next";
import { blogVisible } from "./lib/blog";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // The site is fully static — `npm run build` writes a plain folder of HTML
  // you can drop on Netlify, Vercel, GitHub Pages, Cloudflare, or any host.
  output: "export",

  // Static export can't use the Next image optimiser, and these assets are
  // already sized for the layout.
  images: { unoptimized: true },

  // Nicer URLs on static hosts: /products/oda/ instead of /products/oda.html
  trailingSlash: true,

  // The blog's routes are page.blog.tsx files, which are pages only while
  // the blog is visible (features.blog on and at least one published post,
  // lib/blog.ts). Hidden, they are not built at all, so /blog/ and every post
  // URL are real 404s on the host rather than pages that merely say so. This
  // also stops the build if a published post still has an editor's note.
  pageExtensions: blogVisible() ? ["tsx", "ts", "blog.tsx"] : ["tsx", "ts"],

  // Test-only: scripts/build-flags-fixture.mjs exports a second copy of the
  // site to out-flags/. Unset for every real build, which writes out/.
  ...(process.env.MUGU_EXPORT_DIR ? { distDir: process.env.MUGU_EXPORT_DIR } : {}),
};

export default nextConfig;
