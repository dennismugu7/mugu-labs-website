import { expect, test } from "@playwright/test";
import { BLOG_DIR, blogShows, livePosts, loadPosts, todayInNairobi } from "../../lib/blog";
import { features, site } from "../../lib/site";
import { expectJpegShareImage } from "./helpers";

/*
 * The real build: the blog is on, with the posts whose date has come in
 * Nairobi. Which posts those are moves with the calendar, so these tests
 * only check the wiring against today's date; blog.spec.ts tests the blog
 * itself, and blog-guard.spec.ts the schedule, both on a fixed "today".
 */

const all = loadPosts({ dir: BLOG_DIR, publishDrafts: false });
const out = livePosts(all, todayInNairobi());
const scheduled = all.filter((p) => !out.includes(p));

test.describe("the live blog", () => {
  test.skip(({ isMobile }) => isMobile, "page-level, no layout involved");

  test("the rule: the flag on AND at least one published post; both hold", () => {
    expect(blogShows(true, 1)).toBe(true);
    expect(blogShows(true, 0)).toBe(false);
    expect(blogShows(false, 5)).toBe(false);
    expect(blogShows(undefined, 5)).toBe(false);
    expect(features.blog).toBe(true);
    expect(out.length).toBeGreaterThan(0);
  });

  test("/blog/ lists exactly the posts out today, newest first", async ({ page }) => {
    await page.goto("/blog/");
    await expect(page.locator(".post-card__title")).toHaveText(out.map((p) => p.title));
  });

  test("each post out today is built; each still scheduled is a 404", async ({ request }) => {
    for (const post of out) expect((await request.get(`/blog/${post.slug}/`)).status(), post.slug).toBe(200);
    for (const post of scheduled) expect((await request.get(`/blog/${post.slug}/`)).status(), post.slug).toBe(404);
  });

  test("the sitemap has the blog and today's posts, not the scheduled ones", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain(`<loc>${site.url}/blog/</loc>`);
    for (const post of out) expect(xml).toContain(`<loc>${site.url}/blog/${post.slug}/</loc>`);
    for (const post of scheduled) expect(xml).not.toContain(`/blog/${post.slug}/`);
  });

  test("every published post's share image is a 1200×630 JPEG that exists", async ({ page, request }) => {
    for (const post of out) await expectJpegShareImage(page, request, `/blog/${post.slug}/`);
  });

  test("the home page shows the latest three", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#blog");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("From the blog");
    await expect(section.locator(".post-card__title")).toHaveText(out.slice(0, 3).map((p) => p.title));
  });
});

test("Blog in the nav, the phone menu and the footer", async ({ page, isMobile }) => {
  await page.goto("/products/oda/");
  const nav = isMobile ? page.locator("#nav-panel") : page.getByRole("navigation", { name: "Primary" });
  await expect(nav.getByRole("link", { name: "Blog", includeHidden: true })).toHaveAttribute("href", "/blog/");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog/");
});
