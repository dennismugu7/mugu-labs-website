import { expect, test, type Locator, type Page } from "@playwright/test";
import { products } from "../../lib/site";
import { gotoReady, waitForScrollToSettle } from "./helpers";

/* The home page's product cards: the whole card is one link (a stretched
   link), at 390px (mobile) and 1366px (desktop). */

function card(page: Page, slug: string) {
  return page.locator("#products .product", { has: page.locator(`a[href="/products/${slug}/"]`) });
}

/** Bring the card into view and wait for it to finish revealing. */
async function showCard(page: Page, c: Locator) {
  await c.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await waitForScrollToSettle(page);
  await expect
    .poll(() => c.evaluate((el) => getComputedStyle(el.parentElement!).opacity))
    .toBe("1");
}

/** A real mouse click at a point, so hit-testing decides what gets it. */
async function clickAt(page: Page, x: number, y: number) {
  await page.mouse.click(Math.round(x), Math.round(y));
}

async function centre(target: Locator) {
  const box = await target.boundingBox();
  expect(box, "target should be on the page").not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

const TARGETS: { label: string; point: (c: Locator) => Promise<{ x: number; y: number }> }[] = [
  { label: "icon", point: (c) => centre(c.locator(".product__icon img")) },
  { label: "title", point: (c) => centre(c.locator(".product__name")) },
  { label: "text", point: (c) => centre(c.locator(".product__tagline")) },
  {
    // The padding at the card's top left: nothing there but the card.
    label: "empty space",
    point: async (c) => {
      const box = (await c.boundingBox())!;
      return { x: box.x + 14, y: box.y + 14 };
    },
  },
];

for (const p of products) {
  test(`${p.name}: one link, one tab stop`, async ({ page }) => {
    await gotoReady(page, "/");
    const c = card(page, p.slug);
    await expect(c.getByRole("link")).toHaveCount(1);
    await expect(c.locator("a, button, [tabindex]")).toHaveCount(1);
    await expect(c.getByRole("link")).toHaveAccessibleName(`Learn more about ${p.name}`);
  });

  for (const t of TARGETS) {
    test(`${p.name}: clicking the card's ${t.label} opens its page`, async ({ page }) => {
      await gotoReady(page, "/");
      const c = card(page, p.slug);
      await showCard(page, c);
      const { x, y } = await t.point(c);

      // What is under the point is the card's link (its ::after).
      const hit = await page.evaluate(([px, py]) => {
        const el = document.elementFromPoint(px, py);
        return el?.closest("a")?.getAttribute("href") ?? null;
      }, [x, y]);
      expect(hit).toBe(`/products/${p.slug}/`);

      await clickAt(page, x, y);
      await expect(page).toHaveURL(new RegExp(`/products/${p.slug}/$`));
    });
  }
}

test("keyboard focus rings the whole card", async ({ page }) => {
  await gotoReady(page, "/");
  const c = card(page, products[0].slug);
  await showCard(page, c);
  const link = c.getByRole("link");
  // Tab onto the card's link from the element before it.
  await page.evaluate(() => {
    const b = document.createElement("button");
    b.id = "__before";
    b.textContent = "before";
    document.querySelector("#products .product")!.before(b);
    b.focus();
  });
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();

  const ring = await link.evaluate((a) => {
    const after = getComputedStyle(a, "::after");
    const r = a.parentElement!.getBoundingClientRect();
    return { style: after.outlineStyle, width: after.outlineWidth, cardWidth: r.width, afterWidth: after.width };
  });
  expect(ring.style).toBe("solid");
  expect(ring.width).toBe("2px");
  // The ring is drawn round the whole card, not the button.
  expect(parseFloat(ring.afterWidth)).toBeCloseTo(ring.cardWidth - 2, 0);
});
