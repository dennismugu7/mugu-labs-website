import { expect, test, type Page } from "@playwright/test";
import { products, site } from "../../lib/site";

/* Share cards, sitemap dates and the footer line. Page-level, so desktop only. */
test.skip(({ isMobile }) => isMobile, "page metadata does not depend on the viewport");

const meta = (page: Page, key: string) =>
  page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute("content");

for (const product of products) {
  test(`${product.slug} keeps the share image and has its own card text`, async ({ page }) => {
    await page.goto(`/products/${product.slug}/`);
    const title = `${product.name} — ${site.name}`;

    expect(await meta(page, "og:image")).toBe(`${site.url}/og.jpg`);
    expect(await meta(page, "og:type")).toBe("website");
    expect(await meta(page, "og:site_name")).toBe(site.name);
    expect(await meta(page, "og:title")).toBe(title);
    expect(await meta(page, "og:description")).toBe(product.tagline);
    expect(await meta(page, "og:url")).toBe(`${site.url}/products/${product.slug}/`);

    expect(await meta(page, "twitter:card")).toBe("summary_large_image");
    expect(await meta(page, "twitter:image")).toBe(`${site.url}/og.jpg`);
    expect(await meta(page, "twitter:title")).toBe(title);
    expect(await meta(page, "twitter:description")).toBe(product.tagline);
  });
}

test("sitemap dates come from lib/site.ts, not the build", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const lastmod = (path: string) =>
    xml.match(new RegExp(`<loc>${site.url}${path}</loc>\\s*<lastmod>([^<]+)</lastmod>`))?.[1];

  expect(lastmod("/")).toBe(site.updated);
  for (const p of products) expect(lastmod(`/products/${p.slug}/`)).toBe(p.updated);
});

test("footer copyright line", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".footer__legal")).toHaveText(`© ${new Date().getFullYear()} Mugu Labs. All rights reserved.`);
});
