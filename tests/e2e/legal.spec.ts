import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { products, site } from "../../lib/site";
import { gotoReady } from "./helpers";

/*
 * Privacy and Terms live on the app (app.mugu-labs.com). The footer links
 * there from every page, and /privacy and /terms on this site redirect
 * there. The redirects are Vercel's (vercel.json), so locally they are
 * checked as declared; the live check is in the deploy notes.
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

test("vercel.json redirects /privacy and /terms, with and without the slash", () => {
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"));
  const redirects: { source: string; destination: string; permanent?: boolean }[] = config.redirects ?? [];
  const to = (source: string) => redirects.find((r) => r.source === source)?.destination;
  expect(to("/privacy")).toBe(PRIVACY);
  expect(to("/privacy/")).toBe(PRIVACY);
  expect(to("/terms")).toBe(TERMS);
  expect(to("/terms/")).toBe(TERMS);
  // The cache headers are still there too.
  expect(config.headers.map((h: { source: string }) => h.source)).toEqual([
    "/_next/static/(.*)",
    "/fonts/(.*)",
    "/assets/(.*)",
  ]);
});
