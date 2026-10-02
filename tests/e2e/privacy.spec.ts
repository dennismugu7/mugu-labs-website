import { expect, test } from "@playwright/test";
import { formatDate } from "../../lib/blog";
import { site } from "../../lib/site";
import { gotoReady } from "./helpers";

/*
 * The website's own privacy page. (Every page's footer link to it is
 * clicked by links.spec.ts, from the footer's link map; legal.spec.ts checks
 * the link's target and that vercel.json no longer redirects /privacy.)
 */

test.describe("/privacy/", () => {
  test.skip(({ isMobile }) => isMobile, "page content does not depend on the viewport");

  test("is a page of its own, not a redirect", async ({ request }) => {
    const res = await request.get("/privacy/", { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Privacy at Mugu Labs");
  });

  test("the heading, both Dashboard X links, the contact address and the date", async ({ page }) => {
    await gotoReady(page, "/privacy/");
    await expect(page).toHaveTitle(`Privacy — ${site.name}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy at Mugu Labs");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "What this website collects",
      "When you contact us",
      "Our apps",
      "Questions",
    ]);

    const apps = page.locator(".prose li").first();
    await expect(apps).toContainText("Dashboard X");
    await expect(apps.getByRole("link", { name: "Privacy policy" })).toHaveAttribute(
      "href",
      "https://app.mugu-labs.com/privacy"
    );
    await expect(apps.getByRole("link", { name: "Terms of service" })).toHaveAttribute(
      "href",
      "https://app.mugu-labs.com/terms"
    );
    await expect(page.getByRole("link", { name: "support@mugu-labs.com" })).toHaveAttribute(
      "href",
      "mailto:support@mugu-labs.com"
    );
    await expect(page.locator(".privacy__updated")).toHaveText(`Last updated: ${formatDate(site.privacyUpdated)}`);
    expect(formatDate(site.privacyUpdated)).toBe("2 October 2026");
  });

  test("set like a blog post", async ({ page }) => {
    await gotoReady(page, "/privacy/");
    await expect(page.locator(".shell--read .prose")).toHaveCount(1);
    await expect(page.locator(".prose ul")).toHaveCSS("list-style-type", "disc");
    await expect(page.locator(".prose a").first()).toHaveCSS("text-decoration-line", "underline");
  });

  test("its own share tags, and in the sitemap", async ({ page, request }) => {
    await page.goto("/privacy/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${site.url}/privacy/`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${site.url}/privacy/`);
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toMatch(new RegExp(`<loc>${site.url}/privacy/</loc>\\s*<lastmod>${site.privacyUpdated}`));
  });
});
