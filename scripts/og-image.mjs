/**
 * Renders the share image (Open Graph / Twitter card) to public/og.jpg.
 *
 *   npm run build
 *   node scripts/og-image.mjs
 *
 * It is built from the built site itself, so there is one source of truth:
 * the page's own stylesheet (Poppins, the `.display` headline, the brand
 * gradient), the robot mark straight out of the footer, and the hero line
 * from lib/site.ts. Change the wordmark, the gradient or the line and re-run.
 *
 * Needs the Chromium that Playwright downloads (`npx playwright install
 * chromium`, once per machine) and serves out/ itself on a free port.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.resolve(process.argv[2] || "public/og.jpg");
const WIDTH = 1200;
const HEIGHT = 630;

// ---- static server for out/ -------------------------------------------------
const PORT = 4178;
const BASE = `http://127.0.0.1:${PORT}`;
const require = createRequire(import.meta.url);
const serveBin = require.resolve("serve/build/main.js", { paths: [root] });
const server = spawn(process.execPath, [serveBin, "out", "-l", String(PORT), "-n"], { cwd: root, stdio: "ignore" });
await new Promise((resolve, reject) => {
  const started = Date.now();
  const tick = () => {
    http
      .get(`${BASE}/`, (res) => (res.statusCode === 200 ? resolve() : retry()))
      .on("error", retry);
  };
  const retry = () => (Date.now() - started > 30000 ? reject(new Error("serve did not start")) : setTimeout(tick, 250));
  tick();
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// Replace the page body with the card, keeping the backdrop (the brand
// gradient, blue at --tint 0) and the stylesheet. The mark is the footer's
// own SVG; the copy is what the page renders from lib/site.ts.
await page.evaluate(({ WIDTH, HEIGHT }) => {
  const mark = document.querySelector(".footer__mark").outerHTML;
  const name = document.querySelector(".brand").textContent.trim();
  const line = document.querySelector("#hero-title").textContent.trim();
  const domain = new URL(document.querySelector('meta[property="og:url"]').content).hostname;

  document.querySelector("main").remove();
  document.querySelector("[data-nav]").remove();
  document.querySelector("footer").remove();
  document.querySelectorAll(".skip-link").forEach((n) => n.remove());
  document.documentElement.style.setProperty("--tint", "0");

  const style = document.createElement("style");
  style.textContent = `
    html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
    .og { position: relative; display: flex; flex-direction: column; justify-content: space-between;
          width: ${WIDTH}px; height: ${HEIGHT}px; padding: 64px 72px 56px; }
    .og__brand { display: flex; align-items: center; gap: 22px; font-weight: 700; font-size: 34px; letter-spacing: -0.01em; }
    .og__brand svg { width: 92px; height: 92px; animation: none; filter: drop-shadow(0 0 30px rgba(150, 90, 255, 0.55)); }
    .og__line { max-width: 11ch; font-size: 108px; line-height: 0.96; text-wrap: wrap; }
    .og__domain { font-size: 26px; font-weight: 500; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.02em; }
  `;
  document.head.append(style);

  const card = document.createElement("div");
  card.className = "og";
  card.innerHTML = `
    <div class="og__brand">${mark}<span>${name}</span></div>
    <h1 class="display og__line">${line}</h1>
    <p class="og__domain">${domain}</p>
  `;
  document.body.append(card);
}, { WIDTH, HEIGHT });

await page.waitForTimeout(300);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
// JPEG: the gradient plus grain is ~780KB as PNG and ~110KB here, and every
// crawler that reads og:image reads JPEG.
await page.screenshot({ path: outFile, type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
await browser.close();
server.kill();

const { size } = fs.statSync(outFile);
console.log(`${path.relative(root, outFile)}  ${WIDTH}x${HEIGHT}  ${(size / 1024).toFixed(0)}KB`);
