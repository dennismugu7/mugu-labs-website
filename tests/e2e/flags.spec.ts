import { expect, test } from "@playwright/test";
import fixture from "./flags-fixture.json";
import { socials } from "../../lib/site";
import { loadPosts } from "../../lib/blog";
import { clickLink, expectContentVisible, gotoReady } from "./helpers";

/*
 * Runs against out-flags/: the same site built with the hidden sections
 * switched on and given something to show (flags-fixture.json, via
 * scripts/build-flags-fixture.mjs). The "flags" project serves it.
 */

// The fixture publishes the five drafts in content/blog (publishDrafts).
const newestFirst = loadPosts({ publishDrafts: true }).sort((a, b) => b.date.localeCompare(a.date));

test("the home page's Blog section: the latest three posts and a way to the rest", async ({ page }) => {
  await gotoReady(page, "/");
  const section = page.locator("#blog");
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("From the blog");
  await expect(section.locator(".post-card__title")).toHaveText(newestFirst.slice(0, 3).map((p) => p.title));
  await expect(section.getByRole("link", { name: "More on the blog" })).toHaveAttribute("href", "/blog/");
});

test("Blog in the nav, the phone menu and the footer", async ({ page }) => {
  await gotoReady(page, "/products/oda/");
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Blog" })).toHaveAttribute(
    "href",
    "/blog/"
  );
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog/");
  await expect(page.getByRole("link", { name: "Journal", includeHidden: true })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#nav-panel").getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog/");
});

test("the nav's Blog link opens the blog", async ({ page }) => {
  await gotoReady(page, "/");
  await clickLink(page, { region: "nav", name: "Blog", to: "/blog/" });
  await expect(page).toHaveURL("/blog/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
  await expectContentVisible(page);
});

test("the socials come back, with only the linked profiles", async ({ page }) => {
  await gotoReady(page, "/#connect");
  const connect = page.locator("#connect");
  await expect(connect.getByRole("heading")).toHaveText("Let’s stay connected");

  const linked = Object.entries(fixture.socialHrefs);
  await expect(connect.locator(".socials li")).toHaveCount(linked.length);
  await expect(connect.locator(".social--placeholder")).toHaveCount(0);
  for (const [id, href] of linked) {
    const name = socials.find((s) => s.id === id)!.name;
    await expect(connect.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
});
