/**
 * Golden screenshots of the built export, one per design comp, for review
 * against docs/site/screens/ and as byte-stable regression images.
 *
 *   npm run build
 *   node scripts/goldens.mjs [outDir]        # default docs/site/review/goldens
 *
 * The frames themselves stay out of git (D13). What is committed is
 * <outDir>/hashes.json — a SHA-256 per golden — and every run reports which
 * hashes moved against the committed set, so a render change fails loudly.
 *
 * Needs the Chromium that Playwright downloads: `npx playwright install chromium`
 * once per machine. Serves out/ itself on a free port.
 *
 * Every capture freezes CSS animations (the reveal effects are transitions,
 * so they survive), warms every IntersectionObserver reveal by scrolling the
 * page once, then scrolls to the target and waits for the transitions.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.resolve(process.argv[2] || "docs/site/review/goldens");
const shotsDir = path.join(outDir, "shots");
fs.mkdirSync(shotsDir, { recursive: true });
// Start clean: a frame this run does not produce must not survive into the
// hashes as if it had (a renamed frame would otherwise linger as "unchanged").
for (const f of fs.readdirSync(shotsDir)) if (f.endsWith(".png")) fs.unlinkSync(path.join(shotsDir, f));

const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}`;

// ---- static server for out/ -------------------------------------------------
const require = createRequire(import.meta.url);
const serveBin = require.resolve("serve/build/main.js", { paths: [root] });
const server = spawn(process.execPath, [serveBin, "out", "-l", String(PORT), "-n"], {
  cwd: root,
  stdio: "ignore",
});
await new Promise((resolve, reject) => {
  const started = Date.now();
  const tick = () => {
    http
      .get(`${BASE}/`, (res) => (res.statusCode === 200 ? resolve() : retry()))
      .on("error", retry);
  };
  const retry = () => (Date.now() - started > 15000 ? reject(new Error("serve did not start")) : setTimeout(tick, 250));
  tick();
});

const FREEZE = "*, *::before, *::after { animation: none !important; }";

const viewports = {
  desktop: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  // The 1280-1440 band: inside the D12 large-screen block with the least
  // room for --shell, where the content inset is meant to hold at 70px.
  // Hero and products only at these sizes.
  laptop1280: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  laptop: { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 },
  laptop1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

const log = { console: [], failed: [], metrics: {} };
const browser = await chromium.launch();

async function open(name, url, extra = {}) {
  const ctx = await browser.newContext({ ...viewports[name], ...extra });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") log.console.push({ page: url, type: m.type(), text: m.text() });
  });
  page.on("pageerror", (e) => log.console.push({ page: url, type: "pageerror", text: String(e) }));
  page.on("requestfailed", (r) => log.failed.push({ page: url, url: r.url(), error: r.failure()?.errorText }));
  page.on("response", (r) => {
    if (r.status() >= 400) log.failed.push({ page: url, url: r.url(), status: r.status() });
  });
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: FREEZE });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}

// The page sets scroll-behavior: smooth, so every programmatic scroll here
// is forced instant — otherwise the observer sees a glide, not the target.
async function warm(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(1200);
  const left = await page.evaluate(() => document.querySelectorAll("[data-reveal]:not(.is-in)").length);
  if (left) console.log(`  (warm left ${left} reveal(s) unfired)`);
}

async function scrollTo(page, y) {
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), y);
  await page.waitForTimeout(1100);
}

async function shoot(page, file, opts = {}) {
  if (opts.fullPage) {
    // The gradient is position: fixed, which a full-page capture only paints
    // for the first viewport. Stretch it over the document for this shot.
    await page.addStyleTag({
      content: `.backdrop { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; height: ${await page.evaluate(() => document.documentElement.scrollHeight)}px !important; }`,
    });
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: path.join(shotsDir, file), ...opts });
  console.log("  " + file);
}

// Where each comp lives on the built page, in scroll-y terms.
async function targets(page) {
  return page.evaluate(() => {
    const top = (el) => el.getBoundingClientRect().top + window.scrollY;
    const el = (s) => document.querySelector(s);
    // Section frames start where a nav click would land the section: its top
    // less its scroll-margin-top (D19), so the fixed nav never covers a heading.
    const anchor = (s) => top(el(s)) - parseFloat(getComputedStyle(el(s)).scrollMarginTop || "0");
    const [s1, s2] = [...document.querySelectorAll("[data-statement]")];
    const hold = (s) => top(s) + (s.offsetHeight - window.innerHeight) * 0.5;
    return [
      ["01-hero", 0],
      ["02-03-products", anchor("#products")],
      ["04-statement-overload", hold(s1)],
      ["05-statement-breather", hold(s2)],
      ["06-07-journal", anchor("#journal")],
      // Since M4 the journal cards do not fit under the heading in one frame;
      // comp 7 is the cards, so give them a frame with the art fully in it:
      // the art breaks 88px above the grid, and the nav covers the top 73px.
      ["07-journal-cards", top(el("#journal .grid-3")) - 170],
      ["08-about", anchor("#about")],
      // Comp 9 is "how I work" *and* socials on one slide; built, they are
      // taller than a frame, so each gets its own, anchored like a nav click.
      ["09-how-i-work", anchor("#work")],
      ["09-socials", anchor("#connect")],
      ["10-contact-and-footer", document.documentElement.scrollHeight],
    ];
  });
}

// Numbers worth having next to the pictures.
async function metrics(page) {
  return page.evaluate(() => {
    const el = (s) => document.querySelector(s);
    const box = (s) => {
      const e = el(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    };
    const lines = (s) => {
      const e = el(s);
      if (!e) return null;
      const lh = parseFloat(getComputedStyle(e).lineHeight);
      return Math.round(e.getBoundingClientRect().height / lh);
    };
    const type = (s) => {
      const e = el(s);
      if (!e) return null;
      const c = getComputedStyle(e);
      return { size: c.fontSize, weight: c.fontWeight, tracking: c.letterSpacing, lineHeight: c.lineHeight, family: c.fontFamily.split(",")[0] };
    };
    const section = (s) => {
      const e = el(s);
      return e ? Math.round(e.getBoundingClientRect().height) : null;
    };
    const socials = [...document.querySelectorAll(".socials .social")].map((a) => Math.round(a.getBoundingClientRect().top));
    const rows = new Set(socials).size;
    const shell = el("#products .shell") || el(".shell");
    const gutter = shell ? Math.round(shell.getBoundingClientRect().left) : null;
    // Where content actually starts: the shell's edge plus its padding.
    const inset = shell ? Math.round(shell.getBoundingClientRect().left + parseFloat(getComputedStyle(shell).paddingLeft)) : null;
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      pageHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      gutterPx: gutter,
      insetPx: inset,
      anchorOffsetPx: parseFloat(getComputedStyle(el("#work")).scrollMarginTop || "0"),
      backdropFilter: CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)"),
      heroTitle: { ...type("#hero-title"), ...box("#hero-title"), lines: lines("#hero-title") },
      sectionTitle: type("#products-title"),
      statement: type(".statement__text"),
      socialRows: rows,
      socialCount: socials.length,
      sectionHeights: {
        hero: section(".hero"),
        products: section("#products"),
        journal: section("#journal"),
        about: section("#about"),
        work: section("#work"),
        connect: section("#connect"),
        contact: section("#contact"),
      },
      headingLines: {
        products: lines("#products-title"),
        journal: lines("#journal-title"),
        about: lines("#about-title"),
        work: lines("#work-title"),
        connect: lines("#connect-title"),
        contact: lines("#contact-title"),
      },
    };
  });
}

// ---- the comp set, both viewports --------------------------------------------
for (const name of ["desktop", "mobile"]) {
  console.log(name);
  const { ctx, page } = await open(name, "/");
  await warm(page);
  log.metrics[name] = await metrics(page);
  for (const [label, y] of await targets(page)) {
    if (name === "mobile" && label === "07-journal-cards") continue; // the phone frame already shows the cards
    await scrollTo(page, y);
    await shoot(page, `${name}__${label}.png`);
  }
  await ctx.close();
}

// ---- extras ---------------------------------------------------------------------
console.log("extras");
{
  const { ctx, page } = await open("desktop", "/products/bookflow/");
  await warm(page);
  await shoot(page, "desktop__products-detail.png", { fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await open("desktop", "/");
  await warm(page);
  const y = await page.evaluate(() => document.documentElement.scrollHeight);
  await scrollTo(page, y);
  await page.click("#contact button[aria-haspopup='menu']");
  await page.waitForTimeout(600);
  await shoot(page, "desktop__contact-menu.png");
  await ctx.close();
}
{
  const { ctx, page } = await open("desktop", "/", { reducedMotion: "reduce" });
  await page.waitForTimeout(800);
  await shoot(page, "desktop__reduced-motion.png", { fullPage: true });
  await ctx.close();
}
for (const name of ["laptop1280", "laptop", "laptop1440"]) {
  const { ctx, page } = await open(name, "/");
  await warm(page);
  log.metrics[name] = await metrics(page);
  await shoot(page, `${name}__01-hero.png`);
  await scrollTo(page, (await targets(page)).find(([label]) => label === "02-03-products")[1]);
  await shoot(page, `${name}__02-03-products.png`);
  await ctx.close();
}
{
  const { ctx, page } = await open("mobile", "/");
  await page.click(".nav__toggle");
  await page.waitForTimeout(600);
  await shoot(page, "mobile__nav-open.png");
  await ctx.close();
}
// Console + network hygiene on the pages the comp set does not visit.
for (const url of ["/products/dashboard-x/", "/products/oda/", "/404.html"]) {
  const { ctx, page } = await open("desktop", url);
  await page.waitForTimeout(300);
  await ctx.close();
}

await browser.close();
server.kill();
fs.writeFileSync(path.join(outDir, "capture-log.json"), JSON.stringify(log, null, 2) + "\n");

// ---- hashes: the committed regression record ------------------------------------
const hashFile = path.join(outDir, "hashes.json");
const previous = fs.existsSync(hashFile) ? JSON.parse(fs.readFileSync(hashFile, "utf8")) : {};
const current = {};
for (const file of fs.readdirSync(shotsDir).sort()) {
  current[file] = createHash("sha256").update(fs.readFileSync(path.join(shotsDir, file))).digest("hex");
}
const moved = Object.keys(current).filter((f) => previous[f] && previous[f] !== current[f]);
const added = Object.keys(current).filter((f) => !previous[f]);
const gone = Object.keys(previous).filter((f) => !current[f]);
fs.writeFileSync(hashFile, JSON.stringify(current, null, 2) + "\n");

console.log(`\n${Object.keys(current).length} goldens in ${path.relative(root, shotsDir)}`);
console.log(`console: ${log.console.length}  failed requests: ${log.failed.length}`);
if (moved.length) console.log(`CHANGED (${moved.length}):\n  ` + moved.join("\n  "));
if (added.length) console.log(`new (${added.length}): ` + added.join(", "));
if (gone.length) console.log(`missing (${gone.length}): ` + gone.join(", "));
if (!moved.length && !added.length && !gone.length) console.log("all hashes unchanged");
process.exitCode = moved.length || gone.length ? 1 : 0;
