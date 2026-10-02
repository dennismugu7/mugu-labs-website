import { expect, test } from "@playwright/test";
import { products } from "../../lib/site";
import { gotoReady } from "./helpers";

/*
 * The page ends at the footer: scrolled to the bottom, nothing but the
 * footer's own padding below it, and nothing to scroll to sideways. At both
 * widths. (Full-page captures that stretch the fixed backdrop used to show
 * ~600px of gradient under the footer; that was the capture, not the page.)
 */

const pages = ["/", ...products.map((p) => `/products/${p.slug}/`), "/no-such-page/"];

for (const url of pages) {
  test(`${url} ends at the footer`, async ({ page }) => {
    await gotoReady(page, url);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));

    const m = await page.evaluate(() => {
      const de = document.documentElement;
      // The layout box, not getBoundingClientRect: the footer fades in with a
      // slide, and mid-slide its painted box sits lower than its real one.
      const footer = document.querySelector<HTMLElement>("footer")!;
      return {
        gap: de.scrollHeight - (footer.offsetTop + footer.offsetHeight),
        scrollWidth: de.scrollWidth,
        width: window.innerWidth,
      };
    });
    expect(m.gap, "space between the footer and the end of the document").toBeLessThanOrEqual(40);
    expect(m.gap).toBeGreaterThanOrEqual(0);
    expect(m.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(m.width);
  });
}
