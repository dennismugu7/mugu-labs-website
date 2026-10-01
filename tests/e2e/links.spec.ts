import { expect, test } from "@playwright/test";
import {
  PAGES,
  clickLink,
  expectContentVisible,
  expectSameDocument,
  expectSectionAtTop,
  gotoReady,
  markDocument,
} from "./helpers";

/*
 * Every internal link, from every page it appears on: click it, land on the
 * right URL without a full reload, and see the destination's content. This is
 * the regression test for the blank-page bug — before the fix, every one of
 * these that changed page left the new page at opacity 0.
 */

for (const from of PAGES) {
  test.describe(`links on ${from.label}`, () => {
    for (const link of from.links) {
      test(`${link.region} "${link.name}" → ${link.to}`, async ({ page }) => {
        await gotoReady(page, from.url);
        await markDocument(page);

        await clickLink(page, link);

        await expect(page).toHaveURL(link.to);
        await expectSameDocument(page);

        const hash = new URL(link.to, "http://x").hash.slice(1);
        if (hash) await expectSectionAtTop(page, hash);
        await expectContentVisible(page);
      });
    }
  });
}

test.describe("link inventory", () => {
  /* The map above is only a guard if it is complete: a link added to a page
     without a test fails here. Desktop only — the phone menu repeats the
     header links. */
  test.skip(({ isMobile }) => isMobile, "desktop inventory");

  for (const from of PAGES) {
    test(`every internal link on ${from.label} is in the map`, async ({ page }) => {
      await gotoReady(page, from.url);

      const found = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLAnchorElement>("header a, main a, footer a"))
          .filter((a) => a.offsetParent !== null && !/^(https?:|mailto:)/.test(a.getAttribute("href") ?? ""))
          .map((a) => new URL(a.href).pathname + new URL(a.href).hash)
          .sort()
      );
      const expected = from.links.map((l) => l.to).sort();

      expect(found).toEqual(expected);
    });
  }
});

test.describe("no dead links", () => {
  for (const from of PAGES) {
    test(`no visible link on ${from.label} points at "#" or nowhere`, async ({ page }) => {
      await gotoReady(page, from.url);
      const dead = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLAnchorElement>("a"))
          .filter((a) => a.offsetParent !== null)
          .filter((a) => {
            const href = (a.getAttribute("href") ?? "").trim();
            return href === "" || href === "#";
          })
          .map((a) => a.outerHTML.slice(0, 120))
      );
      expect(dead).toEqual([]);
    });
  }

  test("external links open safely", async ({ page }) => {
    await gotoReady(page, "/");
    const github = page.getByRole("main").getByRole("link", { name: /@dennismugu7/ });
    await expect(github).toHaveAttribute("href", "https://github.com/dennismugu7");
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", /noopener/);
  });
});

test.describe("contact menu", () => {
  for (const url of ["/", ...PAGES.filter((p) => p.url.startsWith("/products/")).map((p) => p.url)]) {
    test(`"Contact me" on ${url} offers email and WhatsApp`, async ({ page }) => {
      await gotoReady(page, url);
      const button = page.getByRole("main").getByRole("button", { name: "Contact me" });
      await button.scrollIntoViewIfNeeded();
      await button.click();

      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("menuitem", { name: /Email/ })).toHaveAttribute("href", /^mailto:.+@.+\?subject=/);
      await expect(menu.getByRole("menuitem", { name: /WhatsApp/ })).toHaveAttribute(
        "href",
        /^https:\/\/wa\.me\/\d+\?text=/
      );

      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(button).toBeFocused();
    });
  }
});
