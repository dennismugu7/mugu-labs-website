import { expect, type Page } from "@playwright/test";
import { livePosts, loadPosts, tagSlug, todayInNairobi } from "../../lib/blog";
import { products } from "../../lib/site";

declare global {
  interface Window {
    __spaMarker?: boolean;
  }
}

/* ------------------------------------------------------------ the link map */

export type Region = "brand" | "nav" | "main" | "footer";

export type LinkSpec = {
  region: Region;
  name: string;
  /** The URL the click should end on, path + hash. */
  to: string;
  /** How many links like it the page has (a tag on several cards); the
      click test clicks the first. Default 1. */
  times?: number;
};

const NAV: LinkSpec[] = [
  { region: "nav", name: "Products", to: "/#products" },
  { region: "nav", name: "Blog", to: "/blog/" },
  { region: "nav", name: "About", to: "/#about" },
  { region: "nav", name: "How we work", to: "/#work" },
];

const FOOTER: LinkSpec[] = [
  ...products.map((p) => ({ region: "footer" as const, name: p.name, to: `/products/${p.slug}/` })),
  { region: "footer", name: "Blog", to: "/blog/" },
  { region: "footer", name: "About", to: "/#about" },
  { region: "footer", name: "Contact", to: "/#contact" },
  { region: "footer", name: "Privacy", to: "/privacy/" },
];

const CHROME: LinkSpec[] = [{ region: "brand", name: "Mugu Labs", to: "/" }, ...NAV];

/** The home page's "From the blog": the latest three posts out today in
    Nairobi, each card's title and tags, and the way to the rest. */
const HOME_BLOG: LinkSpec[] = (() => {
  const latest = livePosts(loadPosts(), todayInNairobi()).slice(0, 3);
  const tags = new Map<string, number>();
  for (const post of latest) for (const tag of post.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  return [
    ...latest.map((p) => ({ region: "main" as const, name: p.title, to: `/blog/${p.slug}/` })),
    ...[...tags].map(([tag, times]) => ({ region: "main" as const, name: tag, to: `/blog/tag/${tagSlug(tag)}/`, times })),
    { region: "main", name: "More on the blog", to: "/blog/" },
  ];
})();

/** Every internal link on every page, as the audit's link table lists them. */
export const PAGES: { label: string; url: string; links: LinkSpec[] }[] = [
  {
    label: "home",
    url: "/",
    links: [
      ...CHROME,
      ...products.map((p) => ({
        region: "main" as const,
        name: `Learn more about ${p.name}`,
        to: `/products/${p.slug}/`,
      })),
      ...HOME_BLOG,
      ...FOOTER,
    ],
  },
  ...products.map((p) => ({
    label: p.slug,
    url: `/products/${p.slug}/`,
    links: [
      ...CHROME,
      { region: "main" as const, name: "All products", to: "/#products" },
      { region: "main" as const, name: "See the other apps", to: "/#products" },
      ...FOOTER,
    ],
  })),
  {
    label: "404",
    url: "/no-such-page/",
    links: [...CHROME, { region: "main", name: "Back to the studio", to: "/" }, ...FOOTER],
  },
];

/* --------------------------------------------------------------- actions */

/** Load a page and wait until it has hydrated and the motion layer is up. */
export async function gotoReady(page: Page, url: string) {
  await page.goto(url);
  await waitForMotion(page);
}

/**
 * Wait for initMotion to have run: it runs in an effect, so the app has
 * hydrated and links navigate client-side. Not "fallback": the boot script
 * sets that on a 3s timer whether or not the app has started, and on a busy
 * machine a test that went ahead then clicked links mid-hydration, and the
 * navigation could miss toHaveURL's timeout (lib/motion.ts).
 */
export async function waitForMotion(page: Page) {
  await page.waitForFunction(() => window.__muguMotion === "ready" || window.__muguMotion === "late");
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1366) < 760;

/** Click a link from the map. On a phone, header links go through the menu. */
export async function clickLink(page: Page, link: LinkSpec) {
  const header = page.locator("header[data-nav]");

  if (link.region === "brand") return header.locator("a.brand").click();

  if (link.region === "nav") {
    if (isMobile(page)) {
      await header.getByRole("button", { name: "Open menu" }).click();
      const panel = page.locator("#nav-panel");
      await expect(panel).toBeVisible();
      await panel.getByRole("link", { name: link.name, exact: true }).click();
      await expect(panel).toBeHidden();
      return;
    }
    return header.getByRole("link", { name: link.name, exact: true }).filter({ visible: true }).click();
  }

  const scope = link.region === "main" ? page.getByRole("main") : page.getByRole("contentinfo");
  const target = scope.getByRole("link", { name: link.name, exact: true });
  return ((link.times ?? 1) > 1 ? target.first() : target).click();
}

/** Marks the document so a later check can tell a client-side navigation
    (the case that broke) from a full page load (which always worked). */
export async function markDocument(page: Page) {
  await page.evaluate(() => {
    window.__spaMarker = true;
  });
}

export async function expectSameDocument(page: Page) {
  expect(await page.evaluate(() => window.__spaMarker), "navigation should be client-side").toBe(true);
}

/* -------------------------------------------------------------- assertions */

type RevealState = { total: number; hidden: string[] };

/**
 * The [data-reveal] elements in the viewport, and which of them are not yet
 * visible. "In the viewport" matches the observer in lib/motion.ts (bottom
 * 5% excluded) with margin to spare: at least a quarter of the element.
 */
function revealState(page: Page): Promise<RevealState> {
  return page.evaluate(() => {
    const limit = window.innerHeight * 0.95;
    const inView = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => {
      const r = el.getBoundingClientRect();
      if (!r.height) return false;
      return (Math.min(r.bottom, limit) - Math.max(r.top, 0)) / r.height >= 0.25;
    });
    return {
      total: inView.length,
      hidden: inView
        .filter((el) => parseFloat(getComputedStyle(el).opacity) <= 0.9)
        .map((el) => `<${el.tagName.toLowerCase()} class="${el.className}">`),
    };
  });
}

async function expectInViewVisible(page: Page): Promise<number> {
  let total = 0;
  await expect
    .poll(
      async () => {
        const s = await revealState(page);
        total = s.total;
        return s.hidden;
      },
      { timeout: 2_000, message: "in-viewport [data-reveal] elements should reach opacity > 0.9" }
    )
    .toEqual([]);
  return total;
}

/** Wait for any smooth scroll to finish: the position unchanged for 600ms
    (a smooth scroll may start a beat after the click that asked for it). */
export async function waitForScrollToSettle(page: Page) {
  let last = -1;
  let still = 0;
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => Math.round(window.scrollY));
        still = y === last ? still + 1 : 0;
        last = y;
        return still >= 4;
      },
      { timeout: 8_000, intervals: [150] }
    )
    .toBe(true);
}

/**
 * The page shows its content: what is in view now, and the next screen down
 * (which catches "the hero shows but everything under it is blank").
 */
export async function expectContentVisible(page: Page) {
  await waitForScrollToSettle(page);
  let seen = await expectInViewVisible(page);
  await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "instant" }));
  seen += await expectInViewVisible(page);
  expect(seen, "some [data-reveal] content should have been checked").toBeGreaterThan(0);
}

/** A /#section URL lands with that section at the top, under the fixed nav. */
export async function expectSectionAtTop(page: Page, hash: string) {
  await waitForScrollToSettle(page);
  const { top, best } = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return { top: NaN, best: NaN };
    const top = el.getBoundingClientRect().top;
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    // Where the section sits when the page is scrolled as far as it can go
    // towards it: under the fixed nav (scroll-margin-top), or, for a section
    // near the end of the page, as high as the remaining page allows.
    return { top, best: Math.max(margin, top + window.scrollY - maxScroll) };
  }, hash);
  expect(top, `#${hash} should exist and not be scrolled past`).toBeGreaterThanOrEqual(-2);
  expect(top, `#${hash} should be scrolled to the top`).toBeLessThanOrEqual(best + 50);
}
