import { expect, test } from "@playwright/test";
import { gotoReady } from "./helpers";

/*
 * The blog and the socials are switched off (lib/site.ts → features; the
 * blog also has no published post yet): not rendered at all, no links to
 * them, and their anchors (and the old #journal) land at the top.
 * flags.spec.ts proves they come back when switched on.
 */

test("hidden sections are not in the page", async ({ page }) => {
  await gotoReady(page, "/");
  await expect(page.locator("#blog, #journal")).toHaveCount(0);
  await expect(page.locator("#connect")).toHaveCount(0);
  await expect(page.locator(".socials, .post")).toHaveCount(0);
  await expect(page.getByText("Let’s stay connected")).toHaveCount(0);
  await expect(page.getByText(/Mugu Labs blog/)).toHaveCount(0);
  // The sections around them are still there, in order.
  const ids = await page.locator("main > section[id]").evaluateAll((s) => s.map((e) => e.id));
  expect(ids).toEqual(["products", "about", "work", "contact"]);
});

test("nothing links to a hidden section", async ({ page }) => {
  for (const url of ["/", "/products/oda/", "/no-such-page/"]) {
    await gotoReady(page, url);
    // Header, phone menu (in the DOM even while closed) and footer alike.
    await expect(page.locator('a[href*="#journal"], a[href*="#blog"], a[href*="#connect"], a[href^="/blog"]')).toHaveCount(0);
    await expect(
      page.locator("header, footer").getByRole("link", { name: /^(Journal|Blog)$/, includeHidden: true })
    ).toHaveCount(0);
  }
});

for (const hash of ["blog", "journal", "connect"]) {
  test(`/#${hash} lands at the top of the home page`, async ({ page }) => {
    await gotoReady(page, `/#${hash}`);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator("#hero-title")).toBeInViewport();
  });

  test(`/#${hash} from further down the page goes to the top`, async ({ page }) => {
    await gotoReady(page, "/");
    await page.evaluate(() => document.getElementById("about")!.scrollIntoView({ behavior: "instant" }));
    await page.evaluate((h) => (window.location.hash = h), hash);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test(`/#${hash} from a product page lands at the top`, async ({ page }) => {
    await gotoReady(page, "/products/oda/");
    // A stale bookmark or an old shared link, followed client-side.
    await page.evaluate((h) => {
      const a = document.createElement("a");
      a.href = `/#${h}`;
      a.textContent = "stale";
      document.querySelector("main")!.append(a);
    }, hash);
    await page.getByRole("link", { name: "stale" }).click();
    await expect(page).toHaveURL(`/#${hash}`);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
}
