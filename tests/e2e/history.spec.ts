import { expect, test } from "@playwright/test";
import { products } from "../../lib/site";
import {
  clickLink,
  expectContentVisible,
  expectSameDocument,
  gotoReady,
  markDocument,
  waitForScrollToSettle,
} from "./helpers";

/*
 * Back and forward after client-side navigation. Before the fix, Back to the
 * home page restored the scroll position onto a page of invisible sections.
 */

const [first, second] = products;
const learnMore = (name: string) => ({ region: "main" as const, name: `Learn more about ${name}`, to: "" });

test("home → product → Back to /", async ({ page }) => {
  await gotoReady(page, "/");
  await markDocument(page);

  await clickLink(page, learnMore(first.name));
  await expect(page).toHaveURL(`/products/${first.slug}/`);
  await expectContentVisible(page);

  await page.goBack();
  await expect(page).toHaveURL("/");
  await expectSameDocument(page);
  await expectContentVisible(page);
});

test("home /#products → product → Back to /#products", async ({ page }) => {
  await gotoReady(page, "/");
  await markDocument(page);

  await clickLink(page, { region: "nav", name: "Products", to: "/#products" });
  await expect(page).toHaveURL("/#products");

  await waitForScrollToSettle(page);

  await clickLink(page, learnMore(second.name));
  await expect(page).toHaveURL(`/products/${second.slug}/`);
  await expectContentVisible(page);

  await page.goBack();
  await expect(page).toHaveURL("/#products");
  await expectSameDocument(page);
  // Back lands on the shelf. (The browser can't restore the exact old offset
  // while the shorter product page is still up, so it falls back to the
  // fragment — the shelf heading — rather than the button's offset.)
  await waitForScrollToSettle(page);
  const shelf = await page.evaluate(() => {
    const r = document.getElementById("products")!.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
  });
  expect(shelf.top).toBeLessThan(shelf.vh);
  expect(shelf.bottom).toBeGreaterThan(0);
  await expectContentVisible(page);
});

test("product → product via footer → Back → Forward", async ({ page }) => {
  await gotoReady(page, `/products/${first.slug}/`);
  await markDocument(page);

  await clickLink(page, { region: "footer", name: second.name, to: "" });
  await expect(page).toHaveURL(`/products/${second.slug}/`);
  await expectContentVisible(page);

  await page.goBack();
  await expect(page).toHaveURL(`/products/${first.slug}/`);
  await expectContentVisible(page);

  await page.goForward();
  await expect(page).toHaveURL(`/products/${second.slug}/`);
  await expectSameDocument(page);
  await expectContentVisible(page);
});

test("product → /#work → Back → Forward", async ({ page }) => {
  await gotoReady(page, `/products/${first.slug}/`);
  await markDocument(page);

  await clickLink(page, { region: "nav", name: "How we work", to: "/#work" });
  await expect(page).toHaveURL("/#work");
  await expectContentVisible(page);

  await page.goBack();
  await expect(page).toHaveURL(`/products/${first.slug}/`);
  await expectContentVisible(page);

  await page.goForward();
  await expect(page).toHaveURL("/#work");
  await expectSameDocument(page);
  await expectContentVisible(page);
});

test('404 → "Back to the studio" → home', async ({ page }) => {
  await gotoReady(page, "/no-such-page/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nothing here yet");
  await markDocument(page);

  await clickLink(page, { region: "main", name: "Back to the studio", to: "/" });
  await expect(page).toHaveURL("/");
  await expectSameDocument(page);
  await expectContentVisible(page);
});
