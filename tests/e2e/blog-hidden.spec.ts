import { expect, test } from "@playwright/test";
import { BLOG_DIR, blogShows, loadPosts } from "../../lib/blog";
import { features } from "../../lib/site";

/*
 * The real build: features.blog is off, so
 * nothing blog-related exists. (sections.spec.ts covers the home page's
 * section and links; blog.spec.ts tests the blog itself on the test build.)
 */

test.describe("the blog while it is hidden", () => {
  test.skip(({ isMobile }) => isMobile, "page-level, no layout involved");

  test("the rule: the flag on AND at least one published post", () => {
    expect(blogShows(true, 1)).toBe(true);
    expect(blogShows(true, 0)).toBe(false);
    expect(blogShows(false, 5)).toBe(false);
    expect(blogShows(undefined, 5)).toBe(false);
    // Today: posts are published, but the flag is off.
    expect(features.blog).toBe(false);
    expect(loadPosts({ dir: BLOG_DIR, publishDrafts: false }).filter((p) => !p.draft).length).toBeGreaterThan(0);
  });

  for (const url of ["/blog/", "/blog/15-minute-money-check-in/", "/blog/tag/money-tips/"]) {
    test(`${url} is a 404`, async ({ request }) => {
      const res = await request.get(url);
      expect(res.status()).toBe(404);
    });
  }

  test("no blog in the sitemap", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).not.toContain("/blog");
    expect(xml.match(/<loc>/g)).toHaveLength(5);
  });
});
