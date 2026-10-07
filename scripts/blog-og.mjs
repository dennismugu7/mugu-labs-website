/**
 * Share images for the blog: for every post with a cover, a 1200×630 JPEG
 * (quality 85) centre-cropped from the cover, at
 * public/assets/blog/og/<cover's name>.jpg. Posts use it for og:image and
 * twitter:image (lib/blog.ts); the WebP cover stays the one on the page.
 *
 *   node scripts/blog-og.mjs
 *
 * Run it after adding or changing a cover, and commit what it writes. The
 * build stops if a cover's share image is missing or not 1200×630.
 *
 * Uses sharp, which Next installs for its image tooling.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("sharp is not installed (it comes with next): run `npm install` first.");
  process.exit(1);
}

const SHARE = { width: 1200, height: 630, quality: 85 };

/** "/assets/blog/x.webp" → "/assets/blog/og/x.jpg" (the rule lib/blog.ts uses). */
const shareImagePath = (cover) => `/assets/blog/og/${path.posix.basename(cover).replace(/\.[^.]+$/, "")}.jpg`;

const blogDir = path.join(root, "content", "blog");
const covers = new Set();
for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"))) {
  const match = fs.readFileSync(path.join(blogDir, file), "utf8").match(/^cover:\s*"([^"]+)"/m);
  if (match) covers.add(match[1]);
}

fs.mkdirSync(path.join(root, "public", "assets", "blog", "og"), { recursive: true });
for (const cover of [...covers].sort()) {
  const out = shareImagePath(cover);
  const source = path.join(root, "public", cover);
  const { width, height } = await sharp(source).metadata();
  await sharp(source)
    .resize(SHARE.width, SHARE.height, { fit: "cover", position: "centre" })
    .jpeg({ quality: SHARE.quality })
    .toFile(path.join(root, "public", out));
  const note = width < SHARE.width ? ` (cover is ${width}×${height}: scaled up)` : "";
  console.log(`${out} from ${cover}${note}`);
}
console.log(`${covers.size} share images in public/assets/blog/og/`);
