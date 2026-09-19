/**
 * Screenshots the rendered preview at desktop + phone widths.
 * Scroll positions are derived from the real section offsets, and the two
 * pinned statements are captured mid-hold.
 *
 *   node preview/shoot.mjs
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(here, "shots");
fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });

const BASE = process.env.PREVIEW_BASE || "http://127.0.0.1:8099";
const viewports = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};

const browser = await chromium.launch();

async function shoot(name, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const targets = await page.evaluate(() => {
    const y = (el) => el.getBoundingClientRect().top + window.scrollY;
    const statements = [...document.querySelectorAll("[data-statement]")];
    const out = [
      ["hero", 0],
      ["products", y(document.querySelector("#products")) - 40],
    ];
    statements.forEach((s, i) => {
      // middle of the pinned range = the "hold" frame
      out.push([`statement-${i + 1}`, y(s) + (s.offsetHeight - window.innerHeight) * 0.5]);
    });
    for (const id of ["journal", "about", "work", "connect", "contact"]) {
      const el = document.querySelector(`#${id}`);
      if (el) out.push([id, y(el) - 40]);
    }
    out.push(["footer", document.body.scrollHeight]);
    return out;
  });

  for (const [label, top] of targets) {
    await page.evaluate((t) => window.scrollTo(0, t), top);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(shots, `${name}-${label}.png`) });
  }
  await page.close();
}

for (const [name, viewport] of Object.entries(viewports)) {
  await shoot(name, viewport);
}

{
  const page = await browser.newPage({ viewport: viewports.desktop });
  await page.goto(`${BASE}/contact-open.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(shots, "extra-contact-menu.png") });

  await page.goto(`${BASE}/product.html`, { waitUntil: "networkidle" });
  // scroll through once so every reveal fires before the full-page capture
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(shots, "extra-product.png"), fullPage: true });
  await page.close();
}

await browser.close();
console.log("shot", fs.readdirSync(shots).length, "frames");
