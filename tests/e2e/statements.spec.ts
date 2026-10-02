import { expect, test, type Page } from "@playwright/test";
import { gotoReady } from "./helpers";

/*
 * The two statements on the home page ("Digital overload is real…" and
 * "Take a breather…") must not read as blank pages. Below 768px they are not
 * pinned and take a screen or less; from 768px they pin for about one
 * viewport; with reduced motion they never pin. And nowhere on the page does
 * a visitor scroll through more than 1.2 viewport heights of nothing.
 */

/** Longest run of scrolling with nothing visible on screen, in viewports. */
async function longestEmptyRun(page: Page) {
  // Reveal everything up front and switch transitions off: this measures the
  // layout and the scroll-driven statement fades, not fade-in timing.
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; }" });
  await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((n) => n.classList.add("is-in")));

  return page.evaluate(async () => {
    const vh = window.innerHeight;
    const step = vh * 0.05;
    const max = document.documentElement.scrollHeight - vh;
    const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const opacity = (el: Element | null): number => {
      let o = 1;
      for (let n = el; n && n instanceof Element; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.visibility === "hidden" || s.display === "none") return 0;
        o *= parseFloat(s.opacity);
      }
      return o;
    };

    const somethingVisible = () =>
      Array.from(
        document.querySelectorAll(
          "main h1, main h2, main h3, main p, main img, main a, main button, footer a, footer p, footer svg"
        )
      ).some((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.bottom <= 0 || r.top >= vh) return false;
        return opacity(el) > 0.1;
      });

    let run = 0;
    let longest = 0;
    let where = 0;
    for (let y = 0; y <= max + step; y += step) {
      window.scrollTo({ top: Math.min(y, max), behavior: "instant" });
      await frames();
      if (somethingVisible()) run = 0;
      else {
        run += step;
        if (run > longest) {
          longest = run;
          where = Math.round(Math.min(y, max));
        }
      }
    }
    return { viewports: longest / vh, at: where };
  });
}

test.describe("statements", () => {
  test("never more than 1.2 viewports of empty space", async ({ page }) => {
    await gotoReady(page, "/");
    const { viewports, at } = await longestEmptyRun(page);
    expect(viewports, `longest empty run ${viewports.toFixed(2)} viewports, ending near y=${at}`).toBeLessThanOrEqual(1.2);
  });

  test("pinned only from 768px, for about one viewport", async ({ page }) => {
    await gotoReady(page, "/");
    const sections = await page.locator("[data-statement]").evaluateAll((els) =>
      els.map((el) => ({
        height: (el as HTMLElement).offsetHeight,
        pin: getComputedStyle(el.querySelector(".statement__pin")!).position,
      }))
    );
    const { width, height: vh } = page.viewportSize()!;
    expect(sections).toHaveLength(2);
    for (const s of sections) {
      if (width < 768) {
        expect(s.pin, "no pinning on a phone").toBe("static");
        expect(s.height, "a screen or less").toBeLessThanOrEqual(vh);
      } else {
        expect(s.pin).toBe("sticky");
        // The pin holds for the section's height less one viewport.
        const hold = (s.height - vh) / vh;
        expect(hold, `pinned for ${hold.toFixed(2)} viewports`).toBeGreaterThanOrEqual(0.9);
        expect(hold).toBeLessThanOrEqual(1.1);
      }
    }
  });

  test("with reduced motion, never pinned", async ({ browser, isMobile }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: isMobile ? { width: 390, height: 844 } : { width: 1366, height: 800 },
    });
    const page = await context.newPage();
    await page.goto("/");
    const sections = await page.locator("[data-statement]").evaluateAll((els) =>
      els.map((el) => ({
        height: (el as HTMLElement).offsetHeight,
        pin: getComputedStyle(el.querySelector(".statement__pin")!).position,
        opacity: getComputedStyle(el.querySelector(".statement__text")!).opacity,
      }))
    );
    for (const s of sections) {
      expect(s.pin).toBe("static");
      expect(s.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      expect(s.opacity).toBe("1");
    }
    await context.close();
  });
});
