import { expect, test } from "@playwright/test";
import { expectSectionAtTop, gotoReady } from "./helpers";

/*
 * The socials are switched off (lib/site.ts → features): not rendered at
 * all, no links to them, and their anchor (and the old #journal) lands at
 * the top. flags.spec.ts proves they come back when switched on. The blog
 * is on: its home section sits between the statements and About.
 */

test("the sections, in order; the hidden ones are not in the page", async ({ page }) => {
  await gotoReady(page, "/");
  await expect(page.locator("#journal, #connect")).toHaveCount(0);
  await expect(page.locator(".socials")).toHaveCount(0);
  await expect(page.getByText("Let’s stay connected")).toHaveCount(0);
  const ids = await page.locator("main > section[id]").evaluateAll((s) => s.map((e) => e.id));
  expect(ids).toEqual(["products", "blog", "about", "work", "contact"]);
});

test("nothing links to a hidden section", async ({ page }) => {
  for (const url of ["/", "/products/oda/", "/no-such-page/"]) {
    await gotoReady(page, url);
    // Header, phone menu (in the DOM even while closed) and footer alike.
    await expect(page.locator('a[href*="#journal"], a[href*="#connect"]')).toHaveCount(0);
    await expect(
      page.locator("header, footer").getByRole("link", { name: /^Journal$/, includeHidden: true })
    ).toHaveCount(0);
  }
});

test("/#blog lands on the home page's blog section", async ({ page }) => {
  await gotoReady(page, "/#blog");
  await expectSectionAtTop(page, "blog");
});

for (const hash of ["journal", "connect"]) {
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
