import { expect, test, type Page } from "@playwright/test";
import { formatDate, livePosts, loadPosts, readingMinutes, tagSlug } from "../../lib/blog";
import { products, site } from "../../lib/site";
import fixture from "./flags-fixture.json";
import { clickLink, expectContentVisible, gotoReady } from "./helpers";

/*
 * Runs against out-flags/ ("flags" project): the site built with the test
 * override, which switches the blog on and fixes "today" at fixture.today
 * (2026-10-20), so which posts are out never depends on the calendar.
 */

const all = loadPosts({ publishDrafts: true });
const posts = livePosts(all, fixture.today);
const scheduled = all.filter((p) => !posts.includes(p));
const withProduct = posts.find((p) => p.slug === "15-minute-money-check-in")!;
const withQuote = posts.find((p) => p.slug === "deposits-without-the-awkwardness")!;
const noProduct = posts.find((p) => !p.product)!;

const meta = (page: Page, key: string) =>
  page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute("content");

test.describe("/blog/", () => {
  test("every post, newest first, with date, reading time, excerpt and tags", async ({ page }) => {
    await gotoReady(page, "/blog/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
    const cards = page.locator(".post-card");
    await expect(cards).toHaveCount(posts.length);
    await expect(cards.locator(".post-card__title")).toHaveText(posts.map((p) => p.title));

    for (let i = 0; i < posts.length; i++) {
      const card = cards.nth(i);
      const post = posts[i];
      await expect(card.getByRole("link", { name: post.title })).toHaveAttribute("href", `/blog/${post.slug}/`);
      await expect(card.locator(".post-meta")).toHaveText(`${formatDate(post.date)} · ${readingMinutes(post)} min read`);
      await expect(card.locator("time")).toHaveAttribute("datetime", post.published);
      await expect(card.locator(".post-card__excerpt")).toHaveText(post.excerpt);
      await expect(card.locator(".tag")).toHaveText(post.tags);
      for (const tag of post.tags)
        await expect(card.getByRole("link", { name: tag })).toHaveAttribute("href", `/blog/tag/${tagSlug(tag)}/`);
    }
    expect(await meta(page, "og:title")).toBe(`Blog — ${site.name}`);
  });

  test("a card's tag opens its tag page", async ({ page }) => {
    await gotoReady(page, "/blog/");
    const tagged = posts.find((p) => p.tags.includes("Money tips"))!;
    const card = page.locator(".post-card", { has: page.getByRole("link", { name: tagged.title }) });
    await card.getByRole("link", { name: "Money tips" }).click();
    await expect(page).toHaveURL("/blog/tag/money-tips/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Money tips");
    await expectContentVisible(page);
  });
});

test.describe("covers", () => {
  const covered = posts.filter((p) => p.cover);
  const bare = posts.filter((p) => !p.cover);

  test("cards: a cover along the top when the post has one, else the plain card", async ({ page }) => {
    expect(covered.length).toBeGreaterThan(0);
    expect(bare.length).toBeGreaterThan(0);
    await gotoReady(page, "/blog/");
    const cards = page.locator(".post-card");
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const card = cards.nth(i);
      const img = card.locator("img.post-cover");
      if (!post.cover) {
        await expect(img, post.slug).toHaveCount(0);
        await expect(card).not.toHaveClass(/post-card--cover/);
        continue;
      }
      await expect(card).toHaveClass(/post-card--cover/);
      await expect(img).toHaveAttribute("src", post.cover.src);
      await expect(img).toHaveAttribute("width", String(post.cover.width));
      await expect(img).toHaveAttribute("height", String(post.cover.height));
      // The title names the post; on a card the cover is decoration.
      await expect(img).toHaveAttribute("alt", "");
      // Only the first card is in view on arrival.
      await expect(img).toHaveAttribute("loading", i === 0 ? "eager" : "lazy");
    }
  });

  test("16:9 with rounded corners, at any width", async ({ page }) => {
    for (const width of [390, 1366]) {
      await page.setViewportSize({ width, height: 844 });
      await gotoReady(page, `/blog/${covered[0].slug}/`);
      const img = page.locator("img.post-page__cover");
      await expect(img).toBeVisible();
      const box = (await img.boundingBox())!;
      expect(box.width / box.height, `${width}px`).toBeCloseTo(16 / 9, 1);
      expect(parseFloat(await img.evaluate((n) => getComputedStyle(n).borderTopLeftRadius))).toBeGreaterThan(0);
    }
  });

  test("a post shows its cover at the top, described, loaded at once, and shares it", async ({ page }) => {
    const post = covered[0];
    await gotoReady(page, `/blog/${post.slug}/`);
    const img = page.locator("article img.post-page__cover");
    await expect(img).toHaveAttribute("src", post.cover!.src);
    await expect(img).toHaveAttribute("alt", post.cover!.alt);
    await expect(img).toHaveAttribute("loading", "eager");
    await expect(img).toHaveAttribute("fetchpriority", "high");
    await expect(img).toHaveAttribute("width", String(post.cover!.width));
    // Above the title.
    const [imgTop, titleTop] = await Promise.all(
      [img, page.locator("#post-title")].map((l) => l.evaluate((n) => n.getBoundingClientRect().top))
    );
    expect(imgTop).toBeLessThan(titleTop);
    await expect.poll(() => img.evaluate((n: HTMLImageElement) => n.naturalWidth)).toBe(post.cover!.width);

    expect(await meta(page, "og:image")).toBe(`${site.url}${post.cover!.src}`);
    expect(await meta(page, "og:image:width")).toBe(String(post.cover!.width));
    expect(await meta(page, "og:image:height")).toBe(String(post.cover!.height));
    expect(await meta(page, "og:image:alt")).toBe(post.cover!.alt);
    expect(await meta(page, "twitter:image")).toBe(`${site.url}${post.cover!.src}`);
  });

  test("a post without a cover has none, and shares the site's image", async ({ page }) => {
    const post = bare[0];
    await gotoReady(page, `/blog/${post.slug}/`);
    await expect(page.locator("article img.post-cover")).toHaveCount(0);
    expect(await meta(page, "og:image")).toBe(`${site.url}/og.jpg`);
    expect(await meta(page, "twitter:image")).toBe(`${site.url}/og.jpg`);
  });

  test("on the home page the covers load lazily", async ({ page }) => {
    await gotoReady(page, "/");
    const imgs = page.locator("#blog img.post-cover");
    const n = await imgs.count();
    for (let i = 0; i < n; i++) await expect(imgs.nth(i)).toHaveAttribute("loading", "lazy");
  });
});

test.describe("a post", () => {
  test("title, byline, tags and the body's typography", async ({ page }) => {
    await gotoReady(page, `/blog/${withProduct.slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(withProduct.title);
    await expect(page.locator(".post-page__byline")).toHaveText("By Mugu Labs team");
    await expect(page.locator(".post-page__head .tag")).toHaveText(withProduct.tags);

    const prose = page.locator(".prose");
    await expect(prose.locator("h2").first()).toBeVisible();
    await expect(prose.locator("ul > li").first()).toBeVisible();
    const link = prose.locator("a").first();
    await expect(link).toHaveCSS("text-decoration-line", "underline");
    // Headings are set apart from the body text.
    const [h2Size, pSize] = await Promise.all(
      [prose.locator("h2").first(), prose.locator("p").first()].map((l) =>
        l.evaluate((n) => parseFloat(getComputedStyle(n).fontSize))
      )
    );
    expect(h2Size).toBeGreaterThan(pSize * 1.2);
    // Lists are lists.
    await expect(prose.locator("ul").first()).toHaveCSS("list-style-type", "disc");

    await gotoReady(page, `/blog/${withQuote.slug}/`);
    const quote = page.locator(".prose blockquote");
    await expect(quote).toHaveCount(1);
    await expect(quote).toHaveCSS("border-left-style", "solid");
  });

  test("its own title, description and share tags", async ({ page }) => {
    await page.goto(`/blog/${withProduct.slug}/`);
    const title = `${withProduct.title} — ${site.name}`;
    await expect(page).toHaveTitle(title);
    expect(await meta(page, "description")).toBe(withProduct.excerpt);
    expect(await meta(page, "author")).toBe("Mugu Labs team");
    expect(await meta(page, "og:type")).toBe("article");
    expect(await meta(page, "og:title")).toBe(title);
    expect(await meta(page, "og:description")).toBe(withProduct.excerpt);
    expect(await meta(page, "og:url")).toBe(`${site.url}/blog/${withProduct.slug}/`);
    expect(await meta(page, "og:image")).toBe(`${site.url}/og.jpg`);
    expect(await meta(page, "article:published_time")).toBe(withProduct.published);
    expect(await meta(page, "twitter:card")).toBe("summary_large_image");
    expect(await meta(page, "twitter:title")).toBe(title);
    expect(await meta(page, "twitter:description")).toBe(withProduct.excerpt);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${site.url}/blog/${withProduct.slug}/`);
  });

  test("links to its product when it has one", async ({ page }) => {
    const product = products.find((p) => p.slug === withProduct.product)!;
    await gotoReady(page, `/blog/${withProduct.slug}/`);
    const card = page.getByRole("complementary", { name: `About ${product.name}` });
    await expect(card.getByRole("link", { name: new RegExp(`See ${product.name}`) })).toHaveAttribute(
      "href",
      `/products/${product.slug}/`
    );

    await gotoReady(page, `/blog/${noProduct.slug}/`);
    await expect(page.locator(".post-product")).toHaveCount(0);
  });

  test("no editor's notes on any page", async ({ page }) => {
    for (const url of ["/", "/blog/", ...posts.map((p) => `/blog/${p.slug}/`)]) {
      await page.goto(url);
      expect(await page.locator("body").innerText(), url).not.toContain("[Dennis");
    }
  });
});

test("a tag page lists that tag's posts, newest first", async ({ page }) => {
  await gotoReady(page, "/blog/tag/money-tips/");
  const tagged = posts.filter((p) => p.tags.includes("Money tips"));
  expect(tagged.length).toBeGreaterThan(1);
  await expect(page.locator(".post-card__title")).toHaveText(tagged.map((p) => p.title));
  await expect(page).toHaveTitle(`Posts tagged “Money tips” — ${site.name}`);
});

test("the sitemap lists the blog, every post and every tag", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs).toContain(`${site.url}/blog/`);
  for (const p of posts) {
    expect(locs).toContain(`${site.url}/blog/${p.slug}/`);
    expect(xml).toContain(`<loc>${site.url}/blog/${p.slug}/</loc>\n<lastmod>${p.published}</lastmod>`);
  }
  const tags = new Set(posts.flatMap((p) => p.tags.map(tagSlug)));
  for (const t of tags) expect(locs).toContain(`${site.url}/blog/tag/${t}/`);
  expect(locs.filter((l) => l.includes("/blog/"))).toHaveLength(1 + posts.length + tags.size);
});

test("the post links from home work", async ({ page }) => {
  await gotoReady(page, "/");
  await clickLink(page, { region: "main", name: posts[0].title, to: `/blog/${posts[0].slug}/` });
  await expect(page).toHaveURL(`/blog/${posts[0].slug}/`);
  await expectContentVisible(page);
});

test.describe(`scheduled posts: after ${fixture.today}, treated as drafts`, () => {
  test("the test build has some of each", () => {
    expect(posts).toHaveLength(7);
    expect(scheduled).toHaveLength(6);
    expect(scheduled.every((p) => p.date > fixture.today && !p.draft)).toBe(true);
  });

  for (const post of scheduled) {
    test(`${post.slug} (${post.date}) is not built`, async ({ request }) => {
      expect((await request.get(`/blog/${post.slug}/`)).status()).toBe(404);
    });
  }

  test("not listed, on the blog, its tag pages or the home page", async ({ page }) => {
    const tagPages = [...new Set(all.flatMap((p) => p.tags.map((t) => `/blog/tag/${tagSlug(t)}/`)))];
    for (const url of ["/blog/", ...tagPages, "/"]) {
      await page.goto(url);
      const titles = await page.locator(".post-card__title").allInnerTexts();
      expect(titles.length, url).toBeGreaterThan(0);
      for (const post of scheduled) {
        expect(titles, url).not.toContain(post.title);
        await expect(page.locator(`a[href="/blog/${post.slug}/"]`), url).toHaveCount(0);
      }
    }
  });

  test("not in the sitemap", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const post of scheduled) expect(xml).not.toContain(`/blog/${post.slug}/`);
  });
});

test("launch day's five, in the order of their times", async ({ page }) => {
  await gotoReady(page, "/blog/");
  const titles = await page.locator(".post-card__title").allInnerTexts();
  const order = [
    "december-plan-written-in-october",
    "meet-the-team",
    "why-we-build-small-apps",
    "15-minute-money-check-in",
    "pay-a-different-account",
  ].map((slug) => all.find((p) => p.slug === slug)!);
  // All on 6 October, after everything dated later, in time order.
  expect(titles.slice(-5)).toEqual(order.map((p) => p.title));
  const first = page.locator(".post-card", { has: page.getByRole("link", { name: order[0].title }) });
  await expect(first.locator("time")).toHaveAttribute("datetime", "2026-10-06T13:00:00+03:00");
  await expect(first.locator("time")).toHaveText("6 October 2026");
});
