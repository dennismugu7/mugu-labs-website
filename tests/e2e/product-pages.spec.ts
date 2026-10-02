import { expect, test, type Locator, type Page } from "@playwright/test";
import { earlyTesterRequest, products, site } from "../../lib/site";
import { gotoReady } from "./helpers";

/*
 * Product pages: the status-driven primary action, each app's colours (and
 * their contrast), Dashboard X's gallery and structured data, and no claim
 * the app doesn't make.
 */

const inDevelopment = products.filter((p) => p.status === "in-development");

/* ------------------------------------------------------------ colour maths */

const rgb = (css: string) => css.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const luminance = ([r, g, b]: number[]) => {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

async function colours(el: Locator) {
  return el.evaluate((n) => {
    const s = getComputedStyle(n);
    return { bg: s.backgroundColor, fg: s.color };
  });
}

/* ------------------------------------------------------- primary actions */

test.describe("primary action", () => {
  for (const product of products) {
    test(`${product.slug}: the Play badge only if live`, async ({ page }) => {
      await gotoReady(page, `/products/${product.slug}/`);
      const badge = page.getByRole("link", { name: "Get it on Google Play" });

      if (product.status === "live") {
        await expect(badge).toHaveAttribute("href", product.playStoreUrl!);
        await expect(badge).toHaveAttribute("target", "_blank");
        await expect(badge).toHaveAttribute("rel", /\bnoopener\b/);
        await expect(badge.locator("img")).toHaveAttribute("src", "/assets/google-play-badge.png");
        await expect(page.getByText("Google Play and the Google Play logo are trademarks of Google LLC.")).toBeVisible();
        await expect(page.getByRole("button", { name: "Become an early tester" })).toHaveCount(0);
      } else {
        await expect(badge).toHaveCount(0);
        await expect(page.locator('a[href*="play.google.com"]')).toHaveCount(0);
      }

      // The secondary action is on every product page.
      await expect(page.getByRole("main").getByRole("link", { name: "See the other apps" })).toHaveAttribute(
        "href",
        "/#products"
      );
    });
  }

  for (const product of inDevelopment) {
    test(`${product.slug}: "Become an early tester" asks with the right message`, async ({ page }) => {
      await gotoReady(page, `/products/${product.slug}/`);
      await expect(page.locator(".detail__head .status-badge")).toHaveText("In development");

      const button = page.getByRole("main").getByRole("button", { name: "Become an early tester" });
      await button.scrollIntoViewIfNeeded();
      await button.click();
      const menu = page.getByRole("main").getByRole("menu");
      await expect(menu).toBeVisible();

      const expected = earlyTesterRequest(product.name);
      expect(expected.message).toBe(`Hi Mugu Labs, I'd like to become an early tester for ${product.name}.`);

      const mail = new URL((await menu.getByRole("menuitem", { name: /Email/ }).getAttribute("href"))!);
      expect(mail.protocol).toBe("mailto:");
      expect(mail.pathname).toBe(site.contact.email);
      expect(mail.searchParams.get("subject")).toBe(`Early tester: ${product.name}`);
      expect(mail.searchParams.get("body")).toBe(expected.message);

      const wa = new URL((await menu.getByRole("menuitem", { name: /WhatsApp/ }).getAttribute("href"))!);
      expect(wa.host).toBe("wa.me");
      expect(wa.pathname).toBe(`/${site.contact.whatsapp}`);
      expect(wa.searchParams.get("text")).toBe(expected.message);
    });
  }
});

/* ---------------------------------------------------------------- colours */

test.describe("brand colours", () => {
  test.skip(({ isMobile }) => isMobile, "colours do not depend on the viewport");

  test("each pair in lib/site.ts reaches WCAG AA", () => {
    for (const p of products) {
      const ratio = contrast(hexRgb(p.brandColor), hexRgb(p.onBrandColor));
      expect(ratio, `${p.name} ${p.brandColor} / ${p.onBrandColor}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('"Learn more" wears the product\'s colour, legibly', async ({ page }) => {
    await gotoReady(page, "/");
    for (const p of products) {
      const button = page.getByRole("link", { name: `Learn more about ${p.name}` });
      const { bg, fg } = await colours(button);
      expect(rgb(bg), `${p.name} button background`).toEqual(hexRgb(p.brandColor));
      expect(rgb(fg), `${p.name} button text`).toEqual(hexRgb(p.onBrandColor));
      expect(contrast(rgb(bg), rgb(fg))).toBeGreaterThanOrEqual(4.5);
    }
  });

  for (const p of inDevelopment) {
    test(`${p.slug}: the badge and the tester button are legible`, async ({ page }) => {
      await gotoReady(page, `/products/${p.slug}/`);
      for (const el of [
        page.locator(".detail__head .status-badge"),
        page.getByRole("button", { name: "Become an early tester" }),
      ]) {
        const { bg, fg } = await colours(el);
        expect(rgb(bg)).toEqual(hexRgb(p.brandColor));
        expect(contrast(rgb(bg), rgb(fg))).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

/* ------------------------------------------------- Dashboard X specifics */

test.describe("Dashboard X", () => {
  const dx = products.find((p) => p.slug === "dashboard-x")!;

  test("screenshots: sized, lazy and described", async ({ page }) => {
    await gotoReady(page, "/products/dashboard-x/");
    const imgs = page.locator(".screens__list img");
    await expect(imgs).toHaveCount(dx.screens.length);
    expect(dx.screens.length).toBe(5);
    for (let i = 0; i < dx.screens.length; i++) {
      const img = imgs.nth(i);
      await expect(img).toHaveAttribute("src", dx.screens[i].src);
      await expect(img).toHaveAttribute("width", String(dx.screens[i].width));
      await expect(img).toHaveAttribute("height", String(dx.screens[i].height));
      await expect(img).toHaveAttribute("loading", "lazy");
      expect((await img.getAttribute("alt"))!.length).toBeGreaterThan(20);
    }
  });

  test("on a phone the screenshots scroll sideways and snap", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone layout");
    await gotoReady(page, "/products/dashboard-x/");
    const list = page.locator(".screens__list");
    await expect(list).toHaveCSS("scroll-snap-type", "x mandatory");
    const { scrollW, clientW, docW, vw } = await list.evaluate((l) => ({
      scrollW: l.scrollWidth,
      clientW: l.clientWidth,
      docW: document.documentElement.scrollWidth,
      vw: window.innerWidth,
    }));
    expect(scrollW).toBeGreaterThan(clientW);
    expect(docW, "the page itself must not scroll sideways").toBeLessThanOrEqual(vw);
  });

  test("SoftwareApplication structured data", async ({ page }) => {
    await page.goto("/products/dashboard-x/");
    const json = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(json).toMatchObject({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Dashboard X",
      operatingSystem: "Android",
      applicationCategory: "FinanceApplication",
      url: "https://play.google.com/store/apps/details?id=com.mugulabs.dashboardx",
    });
    for (const p of inDevelopment) {
      await page.goto(`/products/${p.slug}/`);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    }
  });
});

/* ------------------------------------------------- claims the app can't keep */

test.describe("no scanning or offline claims", () => {
  test.skip(({ isMobile }) => isMobile, "copy does not depend on the viewport");

  const CLAIM = /\b(scan|scans|scanning|scanned|receipts?|offline|on-device)\b/i;
  const pages = ["/", ...products.map((p) => `/products/${p.slug}/`), "/no-such-page/"];

  async function allText(page: Page) {
    return page.evaluate(() => {
      const out = [document.title, document.body.innerText];
      document.querySelectorAll("meta[content]").forEach((m) => out.push(m.getAttribute("content") ?? ""));
      document.querySelectorAll("img[alt]").forEach((i) => out.push(i.getAttribute("alt") ?? ""));
      document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => out.push(s.textContent ?? ""));
      return out.join("\n");
    });
  }

  for (const url of pages) {
    test(url, async ({ page }) => {
      await page.goto(url);
      const hits = (await allText(page)).split("\n").filter((line) => CLAIM.test(line));
      expect(hits).toEqual([]);
    });
  }
});

/* ------------------------------------------------------ gallery caption */

test.describe("gallery caption", () => {
  test.skip(({ isMobile }) => isMobile, "copy does not depend on the viewport");
  const NOTE = "Early designs, still in progress. Shop names and links are examples.";

  for (const p of products) {
    test(`${p.slug}: ${p.slug === "dashboard-x" ? "no caption" : "the early-designs caption above the screens"}`, async ({ page }) => {
      await gotoReady(page, `/products/${p.slug}/`);
      const note = page.locator(".screens__note");
      if (p.slug === "dashboard-x") {
        await expect(note).toHaveCount(0);
        return;
      }
      await expect(note).toHaveText(NOTE);
      // Above the screens, in the small print's muted style.
      const [noteTop, firstScreenTop] = await Promise.all([
        note.evaluate((n) => n.getBoundingClientRect().top),
        page.locator(".screens__list").first().evaluate((n) => n.getBoundingClientRect().top),
      ]);
      expect(noteTop).toBeLessThan(firstScreenTop);
      const [noteStyle, smallPrintStyle] = await Promise.all(
        [note, page.locator(".detail__smallprint:not(.screens__note)")].map((l) =>
          l.evaluate((n) => {
            const s = getComputedStyle(n);
            return [s.color, s.fontSize];
          })
        )
      );
      expect(noteStyle).toEqual(smallPrintStyle);
    });
  }
});

/* ------------------------------------------- claims ODA no longer makes */

test("ODA makes no checked, verified or badge claims", async ({ page, isMobile }) => {
  test.skip(isMobile, "copy does not depend on the viewport");
  await page.goto("/products/oda/");
  const text = await page.evaluate(() =>
    [
      document.title,
      document.body.innerText,
      ...Array.from(document.querySelectorAll("meta[content], img[alt]"), (el) =>
        el.getAttribute("content") ?? el.getAttribute("alt")
      ),
    ].join("\n")
  );
  expect(text).not.toMatch(/checked|verified|badge/i);
  // Nor the payment-handling lines that went with them.
  expect(text).not.toMatch(/never holds your money|\bTill\b|Pochi|Paybill/i);
});

/* ------------------------------------------- Bookflow and ODA (content pack) */

/*
 * The copy and screens from docs/content/product-content-pack.md, written out
 * here so a change to lib/site.ts that drifts from the pack fails.
 */
const PACK = {
  bookflow: {
    intro:
      "Bookflow is a booking app for salons, barbers and beauty studios. Share one link, let clients book themselves, and run the whole day from your phone, deposits, changes and all.",
    features: [
      "Your day at a glance",
      "Deposits that protect your time",
      "Changes without the chaos",
      "The whole team, side by side",
      "A client list that builds itself",
      "One link, anywhere",
    ],
    smallPrint: "Bookflow is still being built with real salons. Features may change before launch.",
    groups: [
      {
        label: null,
        screens: [
          ["bookflow-today.webp", "Bookflow's Today screen showing 8 bookings, 23k expected and 3 gaps, with an unpaid-deposit reminder"],
          ["bookflow-booking-detail.webp", "A booking with services, an M-Pesa deposit paid and the balance due on the day"],
          ["bookflow-reschedule.webp", "Rescheduling a booking to a new time slot, with an SMS sent to the client"],
          ["bookflow-calendar.webp", "Team day view with each stylist's bookings side by side"],
          ["bookflow-clients.webp", "Client list filtered into new, regular and lapsed clients"],
          ["bookflow-client-profile.webp", "A client profile showing visits, total spent and visit history"],
        ],
      },
    ],
  },
  oda: {
    intro:
      "ODA gives people who sell on WhatsApp, TikTok and Instagram a shop link of their own. Buyers browse, order and pay with M-Pesa in a few taps, then follow their order all the way to their door. No more chasing screenshots in the chat.",
    features: [
      "Your own shop link",
      "Checkout in a few taps",
      "Pay with M-Pesa",
      "Updates on WhatsApp",
      "Live delivery tracking",
      "Ratings that mean something",
    ],
    smallPrint: "ODA is still being built with real sellers. Features may change before launch.",
    groups: [
      {
        label: null,
        screens: [
          ["oda-buyer-shop.webp", "A seller's ODA shop page with products, ratings and delivery count"],
          ["oda-buyer-search.webp", "Searching a shop with size and price filters"],
          ["oda-buyer-cart.webp", "A buyer's cart with a free-delivery progress bar"],
          ["oda-buyer-checkout.webp", "Checkout asking only for name, phone number and delivery address"],
          ["oda-buyer-confirmation.webp", "Order placed, with the next steps explained"],
          ["oda-buyer-tracking.webp", "Live delivery tracking with the rider's details and a delivery code"],
          ["oda-buyer-delivered.webp", "Delivered order with a prompt to rate it"],
        ],
      },
    ],
  },
} as const;

for (const [slug, pack] of Object.entries(PACK)) {
  const product = products.find((p) => p.slug === slug)!;

  test.describe(`${product.name} page`, () => {
    test("intro, features and small print from the content pack", async ({ page, isMobile }) => {
      test.skip(isMobile, "copy does not depend on the viewport");
      await gotoReady(page, `/products/${slug}/`);
      const main = page.getByRole("main");

      await expect(main.locator(".detail__tagline")).toHaveText(product.tagline);
      await expect(main.locator(".detail__summary")).toHaveText(pack.intro);
      await expect(main.getByRole("heading", { level: 2, name: "What we're building" })).toBeVisible();
      await expect(main.locator(".feature__title")).toHaveText([...pack.features]);
      // Under the features heading, the feature titles are a level down.
      expect(await main.locator(".feature__title").evaluateAll((els) => els.map((e) => e.tagName))).toEqual(
        pack.features.map(() => "H3")
      );
      await expect(main.locator(".detail__smallprint:not(.screens__note)")).toHaveText(pack.smallPrint);
    });

    test("screens in the pack's order and groups, with its alt text", async ({ page }) => {
      await gotoReady(page, `/products/${slug}/`);
      const groups = page.locator(".screens__group");
      await expect(groups).toHaveCount(pack.groups.length);

      for (let g = 0; g < pack.groups.length; g++) {
        const expected = pack.groups[g];
        const group = groups.nth(g);
        const list = group.locator(".screens__list");

        if (expected.label) {
          const heading = group.getByRole("heading", { level: 3 });
          await expect(heading).toHaveText(expected.label);
          // The scroller is named by its group's label.
          await expect(list).toHaveAttribute("aria-labelledby", (await heading.getAttribute("id"))!);
        } else {
          await expect(group.getByRole("heading", { level: 3 })).toHaveCount(0);
        }

        const imgs = list.locator("img");
        await expect(imgs).toHaveCount(expected.screens.length);
        for (let i = 0; i < expected.screens.length; i++) {
          const [file, alt] = expected.screens[i];
          const img = imgs.nth(i);
          await expect(img).toHaveAttribute("src", `/assets/${slug}/${file}`);
          await expect(img).toHaveAttribute("alt", alt);
          await expect(img).toHaveAttribute("loading", "lazy");
          await expect(img).toHaveAttribute("width", /^\d+$/);
          await expect(img).toHaveAttribute("height", /^\d+$/);
        }

        if (isMobilePage(page)) {
          await expect(list).toHaveCSS("scroll-snap-type", "x mandatory");
        }
      }

      // Every screen on the page is drawn at the same width.
      const widths = await page.locator(".screens__list img").evaluateAll((imgs) =>
        imgs.map((i) => Math.round(i.getBoundingClientRect().width))
      );
      expect(new Set(widths).size, `screen widths ${widths.join(", ")}`).toBe(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  });
}

function isMobilePage(page: Page) {
  return (page.viewportSize()?.width ?? 1366) < 760;
}

test.describe("pricing stays off the site until it is confirmed", () => {
  test.skip(({ isMobile }) => isMobile, "copy does not depend on the viewport");

  for (const url of ["/", ...products.map((p) => `/products/${p.slug}/`)]) {
    test(url, async ({ page }) => {
      await page.goto(url);
      const text = await page.evaluate(() =>
        [document.body.innerText, ...Array.from(document.querySelectorAll("meta[content]"), (m) => m.getAttribute("content"))].join("\n")
      );
      expect(text).not.toMatch(/commission|free core|fee per order|no fees?\b/i);
    });
  }

  // On ODA "free" can only be about price. (Bookflow's "free gaps" are open
  // slots in the day, so this one is ODA's alone.)
  test("ODA calls nothing of its own free", async ({ page }) => {
    await page.goto("/products/oda/");
    const text = await page.evaluate(() =>
      [
        document.title,
        document.body.innerText,
        ...Array.from(document.querySelectorAll("meta[content], img[alt]"), (el) =>
          el.getAttribute("content") ?? el.getAttribute("alt")
        ),
      ].join("\n")
    );
    // The one allowed use: the cart screen's alt text describes the seller's
    // own free-delivery offer shown in the app, not ODA's pricing.
    expect(text.replace(/\bfree[- ]delivery\b/gi, "")).not.toMatch(/\bfree\b/i);
  });
});
