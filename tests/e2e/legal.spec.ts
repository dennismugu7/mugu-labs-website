import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { products, site } from "../../lib/site";
import { gotoReady } from "./helpers";

/*
 * Dashboard X's Privacy and Terms live on the app (app.mugu-labs.com); the
 * footer links there from every page. /privacy and /terms on this site do
 * not redirect (vercel.json).
 */

const PRIVACY = "https://app.mugu-labs.com/privacy";
const TERMS = "https://app.mugu-labs.com/terms";

test("the addresses", () => {
  expect(site.privacyUrl).toBe(PRIVACY);
  expect(site.termsUrl).toBe(TERMS);
});

for (const url of ["/", ...products.map((p) => `/products/${p.slug}/`), "/no-such-page/"]) {
  test(`footer links to Privacy and Terms on ${url}`, async ({ page }) => {
    await gotoReady(page, url);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", PRIVACY);
    await expect(footer.getByRole("link", { name: "Terms", exact: true })).toHaveAttribute("href", TERMS);
  });
}

test("vercel.json has no redirect for /privacy or /terms", () => {
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"));
  const sources: string[] = (config.redirects ?? []).map((r: { source: string }) => r.source);
  expect(sources.filter((s) => /^\/(privacy|terms)\/?$/.test(s))).toEqual([]);
  // The cache headers are still there.
  expect(config.headers.map((h: { source: string }) => h.source)).toEqual([
    "/_next/static/(.*)",
    "/fonts/(.*)",
    "/assets/(.*)",
  ]);
});
