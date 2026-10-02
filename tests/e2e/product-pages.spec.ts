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
