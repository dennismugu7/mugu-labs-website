import { expect, test, type Page } from "@playwright/test";
import { products } from "../../lib/site";
import { clickLink, expectContentVisible, gotoReady, waitForMotion } from "./helpers";

/* The fail-safes, and the scroll-driven effects after in-site navigation. */

const hiddenReveals = (page: Page) =>
  page.evaluate(
    () =>
      Array.from(document.querySelectorAll("[data-reveal]")).filter((el) => getComputedStyle(el).opacity !== "1")
        .length
  );

test.describe("content is visible without the motion layer", () => {
  test("with JavaScript off", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    for (const url of ["/", `/products/${products[0].slug}/`]) {
      await page.goto(url);
      await expect(page.locator("html")).not.toHaveClass(/js-motion/);
      expect(await hiddenReveals(page)).toBe(0);
    }
    await context.close();
  });

  test("when the scripts never load", async ({ page }) => {
    await page.route("**/_next/static/chunks/**", (route) => route.abort());
    await page.goto("/");
    // The boot script hides reveals at first, then gives up waiting.
    await expect(page.locator("html")).not.toHaveClass(/js-motion/, { timeout: 5_000 });
    expect(await hiddenReveals(page)).toBe(0);
  });

  test("when the scripts are slow, and after they arrive", async ({ page }) => {
    await page.route("**/_next/static/chunks/**", async (route) => {
      await new Promise((r) => setTimeout(r, 4_500));
      await route.continue();
    });
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("html")).not.toHaveClass(/js-motion/, { timeout: 5_000 });
    expect(await hiddenReveals(page)).toBe(0);

    // The late motion layer must not hide anything again.
    await waitForMotion(page);
    expect(await page.evaluate(() => window.__muguMotion)).toBe("fallback");
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "instant" }));
    expect(await hiddenReveals(page)).toBe(0);
  });

  test("with reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/js-motion/);
    expect(await hiddenReveals(page)).toBe(0);
    await waitForMotion(page);
    // Statements are laid out statically, not pinned.
    await expect(page.locator(".statement__pin").first()).toHaveCSS("position", "static");

    // ...and still after an in-site navigation.
    await clickLink(page, { region: "main", name: `Learn more about ${products[0].name}`, to: "" });
    await expect(page).toHaveURL(`/products/${products[0].slug}/`);
    expect(await hiddenReveals(page)).toBe(0);
    await context.close();
  });
});

test.describe("scroll effects after in-site navigation", () => {
  /** Arrive on the home page by a client-side link, not a page load. */
  async function homeViaLink(page: Page) {
    await gotoReady(page, `/products/${products[0].slug}/`);
    await clickLink(page, { region: "brand", name: "Mugu labs", to: "/" });
    await expect(page).toHaveURL("/");
    await expectContentVisible(page);
  }

  async function settle(page: Page) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  }

  test("pinned statements still ease in and hold", async ({ page }) => {
    await homeViaLink(page);
    const statements = page.locator("[data-statement]");
    expect(await statements.count()).toBe(2);

    for (let i = 0; i < 2; i++) {
      const el = statements.nth(i);
      // Statement top at the top of the viewport: not yet entered.
      await el.evaluate((n) => window.scrollTo({ top: (n as HTMLElement).offsetTop, behavior: "instant" }));
      await settle(page);
      expect(Number(await el.evaluate((n) => (n as HTMLElement).style.getPropertyValue("--vis")))).toBeLessThan(0.05);

      // Halfway through the pin: fully shown.
      await el.evaluate((n) => {
        const s = n as HTMLElement;
        window.scrollTo({ top: s.offsetTop + (s.offsetHeight - window.innerHeight) / 2, behavior: "instant" });
      });
      await settle(page);
      expect(Number(await el.evaluate((n) => (n as HTMLElement).style.getPropertyValue("--vis")))).toBeGreaterThan(0.95);
    }
  });

  test("background tint follows the sections, and resets on a product page", async ({ page }) => {
    await homeViaLink(page);
    const tint = () =>
      page.evaluate(() => Number(document.documentElement.style.getPropertyValue("--tint") || "0"));

    await page.evaluate(() => document.getElementById("work")!.scrollIntoView({ behavior: "instant" }));
    await settle(page);
    expect(await tint()).toBeGreaterThan(0.8);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await settle(page);
    expect(await tint()).toBeLessThan(0.05);

    // Leave from the violet part of the page: the product page is blue again.
    await page.evaluate(() => document.getElementById("work")!.scrollIntoView({ behavior: "instant" }));
    await settle(page);
    await clickLink(page, { region: "footer", name: products[1].name, to: "" });
    await expect(page).toHaveURL(`/products/${products[1].slug}/`);
    await expect.poll(tint).toBe(0);
  });
});
