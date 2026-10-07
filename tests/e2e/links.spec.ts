import { expect, test } from "@playwright/test";
import {
  PAGES,
  clickLink,
  expectContentVisible,
  expectSameDocument,
  expectSectionAtTop,
  gotoReady,
  isMobile,
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
      const expected = from.links.flatMap((l) => Array<string>(l.times ?? 1).fill(l.to)).sort();

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
  // Product pages have their own primary action now (products.spec.ts).
  for (const url of ["/"]) {
    test(`"Contact us" on ${url} offers email and WhatsApp`, async ({ page }) => {
      await gotoReady(page, url);
      const button = page.getByRole("main").getByRole("button", { name: "Contact us" });
      await button.scrollIntoViewIfNeeded();
      await button.click();

      const menu = page.getByRole("main").getByRole("menu");
      await expect(menu).toBeVisible();
      await expectClickable(page, menu.getByRole("menuitem", { name: /WhatsApp/ }));
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

/** Clicks on the item land on it: nothing later in the page paints over the menu. */
async function expectClickable(page: import("@playwright/test").Page, item: import("@playwright/test").Locator) {
  await item.scrollIntoViewIfNeeded();
  await expect
    .poll(
      async () => {
        const box = await item.boundingBox();
        if (!box) return "no box";
        const vw = page.viewportSize()!.width;
        if (box.x < 0 || box.x + box.width > vw) return `off screen: ${Math.round(box.x)}..${Math.round(box.x + box.width)}`;
        for (const [fx, fy] of [[0.5, 0.5], [0.1, 0.9], [0.9, 0.9]]) {
          const hit = await page.evaluate(
            ([x, y]) => !!document.elementFromPoint(x, y)?.closest(".choice__item"),
            [box.x + box.width * fx, box.y + box.height * fy]
          );
          if (!hit) return `covered at ${fx},${fy}`;
        }
        return "ok";
      },
      { message: "the menu item should be on screen and on top where it is drawn" }
    )
    .toBe("ok");
}

test.describe('"Work with us" opens the contact menu', () => {
  /** Stop the mail client / WhatsApp from actually opening when picked. */
  async function holdContactLinks(page: import("@playwright/test").Page) {
    await page.evaluate(() =>
      document.addEventListener("click", (e) => {
        if ((e.target as Element).closest(".choice__item")) e.preventDefault();
      })
    );
  }

  async function expectContactMenu(menu: import("@playwright/test").Locator) {
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /Email/ })).toHaveAttribute("href", /^mailto:/);
    await expect(menu.getByRole("menuitem", { name: /WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  }

  for (const from of PAGES) {
    test(`from the header on ${from.label}`, async ({ page }) => {
      await gotoReady(page, from.url);
      await holdContactLinks(page);
      const header = page.locator("header[data-nav]");

      if (isMobile(page)) {
        await header.getByRole("button", { name: "Open menu" }).click();
        const panel = page.locator("#nav-panel");
        const button = panel.getByRole("button", { name: "Work with us" });
        await button.click();
        await expectContactMenu(panel.getByRole("menu"));
        // Picking one closes the phone menu too.
        await panel.getByRole("menuitem", { name: /WhatsApp/ }).click();
        await expect(panel).toBeHidden();
        // ...and it opens collapsed next time.
        await header.getByRole("button", { name: "Open menu" }).click();
        await expect(panel.getByRole("menu")).toHaveCount(0);
        await expect(button).toHaveAttribute("aria-expanded", "false");
      } else {
        const button = header.getByRole("button", { name: "Work with us" });
        await button.click();
        const menu = header.getByRole("menu");
        await expectContactMenu(menu);
        // The menu stays inside the viewport.
        const box = (await menu.boundingBox())!;
        expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await expect(button).toBeFocused();
      }
      await expect(page).toHaveURL(from.url);
    });
  }

  test("from the hero", async ({ page }) => {
    await gotoReady(page, "/");
    const hero = page.locator(".hero");
    await hero.getByRole("button", { name: "Work with us" }).click();
    const menu = hero.getByRole("menu");
    await expectContactMenu(menu);
    // The menu hangs below the hero; the next section must not swallow clicks.
    await expectClickable(page, menu.getByRole("menuitem", { name: /WhatsApp/ }));
    await expect(page).toHaveURL("/");
  });
});

test("contact details", async ({ page }) => {
  await gotoReady(page, "/");
  const button = page.getByRole("main").getByRole("button", { name: "Contact us" });
  await button.scrollIntoViewIfNeeded();
  await button.click();
  const menu = page.getByRole("main").getByRole("menu");
  await expect(menu.getByRole("menuitem", { name: /Email/ })).toHaveAttribute(
    "href",
    "mailto:support@mugu-labs.com?subject=Let's%20build%20something"
  );
  await expect(menu.getByRole("menuitem", { name: /Email/ })).toContainText("support@mugu-labs.com");
  const wa = new URL((await menu.getByRole("menuitem", { name: /WhatsApp/ }).getAttribute("href"))!);
  expect(wa.pathname).toBe("/254701408727");
  expect(wa.searchParams.get("text")).toBe("Hi Mugu Labs, I found your website and I'd like to talk about an app.");
});
