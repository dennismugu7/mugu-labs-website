/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // The site is fully static — `npm run build` writes a plain folder of HTML
  // you can drop on Netlify, Vercel, GitHub Pages, Cloudflare, or any host.
  output: "export",

  // Static export can't use the Next image optimiser, and these assets are
  // already sized for the layout.
  images: { unoptimized: true },

  // Nicer URLs on static hosts: /products/oda/ instead of /products/oda.html
  trailingSlash: true,

  // Test-only: scripts/build-flags-fixture.mjs exports a second copy of the
  // site to out-flags/. Unset for every real build, which writes out/.
  ...(process.env.MUGU_EXPORT_DIR ? { distDir: process.env.MUGU_EXPORT_DIR } : {}),
};

export default nextConfig;
