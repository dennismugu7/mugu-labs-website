# Mugu Labs

The studio site — built from the ten design screens.

Next.js (App Router) + TypeScript. **No UI, animation or icon libraries.** The
only dependencies are Next and React; everything else — the motion layer, the
icons, the logo, the styling — is in this repo and yours to change.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # static site → ./out
npm run typecheck    # tsc, no emit
```

`next.config.mjs` sets `output: "export"`, so `npm run build` produces a plain
folder of HTML/CSS/JS in `out/`. No server, no Node runtime needed in
production.

---

## Where to change things

**`lib/site.ts` is the one file you'll edit most.** Copy, contact details,
products, blog teasers, principles and social links all live there. The
components read from it, so nothing else needs touching for a content change.

The things most likely to need your attention first:

| What | Where | Currently |
| --- | --- | --- |
| Social profile URLs | `lib/site.ts` → `socials` | all `"#"` — a placeholder |
| Blog link | `lib/site.ts` → `site.blogUrl` | `"#journal"` — points back at the page |
| Blog post links | `lib/site.ts` → `posts[].href` | `"#"` |
| Contact email | `lib/site.ts` → `site.contact.email` | your Gmail — swap for a domain address when you have one |
| WhatsApp number | `lib/site.ts` → `site.contact.whatsapp` | `254701408727` |
| Site URL (for OG tags + sitemap) | `lib/site.ts` → `site.url` | `https://mugu-labs.com` |

### Structure

```
app/
  layout.tsx              shell: nav, backdrop, footer, metadata
  page.tsx                the one-pager, section by section
  products/[slug]/page.tsx a real page per product, generated from lib/site.ts
  not-found.tsx           404
  sitemap.ts, robots.ts   generated at build time
components/               one file per section, plus Logo, icons, Nav
lib/site.ts               all content and config
lib/motion.ts             the whole animation layer (~2KB)
styles/globals.css        the whole stylesheet, token-first
public/assets/            artwork extracted from your design screens
public/fonts/             self-hosted Poppins, subsetted to Latin
preview/                  dev-only render + screenshot harness (not part of the build)
```

---

## How the motion works

There's no animation library. `lib/motion.ts` does two things:

1. **Reveals.** Anything with `{...reveal()}` spread onto it starts faded,
   blurred and offset, and eases in the first time it enters the viewport. One
   `IntersectionObserver` handles the lot.

2. **Scroll variables.** A single rAF-throttled handler writes CSS custom
   properties — `--tint` on the page (the blue→violet backdrop shift),
   `--enter`/`--exit` on each pinned statement, `--drift` for parallax. CSS
   does all the actual animating, so it stays on the compositor and doesn't
   drop frames on a cheap phone.

To make something reveal on scroll, spread the helper onto it:

```tsx
<h2 {...reveal(0, "section-title")}>Heading</h2>
<li {...reveal(i * 110)}>…</li>
```

`reveal()` returns `className` and `style`, so pass extra classes as its second
argument rather than writing a separate `className` on the same element — a
spread would overwrite it.

**`prefers-reduced-motion: reduce` turns all of it off** — the pinned
statements become ordinary blocks and nothing transitions. That's handled in
CSS and in `initMotion()`, so it holds even if JS is slow to start.

---

## Fonts

Poppins, self-hosted and subsetted to Latin — four weights as `.woff2`, ~32KB
total, no request to Google. The files are in `public/fonts/`, declared in
`styles/fonts.css`.

To regenerate them (after changing the subset, or the source files):

```bash
pip install fonttools brotli
# the Poppins .ttf sources live in scripts/src-fonts/ (fonts.google.com/specimen/Poppins)
python scripts/build-fonts.py --woff2
```

`--woff2` is what the site ships. Without it the script emits `.ttf`, in
which case `styles/fonts.css` needs `format('truetype')` and `.ttf` extensions.

---

## Artwork

The app icons, 3D illustrations, avatar and logo were extracted from the design
screens: icons masked to rounded squares, illustrations cut off the gradient
background and cleaned up, the avatar cropped to a circle. The robot mark is
rebuilt as vector (`components/Logo.tsx` and `public/favicon.svg`) so it stays
sharp at any size.

If you have the originals at higher resolution, drop them into `public/assets/`
under the same filenames and they'll be picked up as-is.

---

## Deploying

**Vercel, connected to GitHub.** The repo is
[`dennismugu7/mugu-labs-website`](https://github.com/dennismugu7/mugu-labs-website).
If you ever need to recreate it from this folder:

```bash
git init -b main
git add -A
git commit -m "Mugu Labs site"
gh repo create dennismugu7/mugu-labs-website --public --source=. --remote=origin --push
```

Then at [vercel.com/new](https://vercel.com/new), sign in with GitHub, import
`mugu-labs-website`, and hit Deploy. Don't change any settings — Next.js is
detected automatically. Add `mugu-labs.com` under **Settings → Domains**.

### After that, updating the site is three lines

```bash
git add -A
git commit -m "what changed"
git push
```

Live in under a minute. Push to a branch instead of `main` and Vercel gives you
a preview URL for it — useful for trying a change before it's public.

### Moving hosts later

The build is a plain static folder (`output: "export"`), so nothing is tied to
Vercel:

- **Cloudflare Pages / Netlify** — build `npm run build`, publish `out`.
  `netlify.toml` is already here with cache headers.
- **GitHub Pages** — publish `out/`. If it lives at `user.github.io/repo`
  rather than a root domain, add `basePath: "/repo"` to `next.config.mjs`.
- **Any host at all** — upload `out/`.

`trailingSlash: true` is set so `/products/oda/` resolves everywhere.

Pushes also run a GitHub Action (`.github/workflows/ci.yml`) that typechecks,
builds, and fails if a section ever renders empty — so a broken change gets
caught before you wonder why the page looks wrong.

---

## Goldens

`scripts/goldens.mjs` screenshots the built site at 1920×1080 and 390×844 (plus
the hero and products at 1280, 1366 and 1440) with
every animation frozen, so two runs of the same build produce identical files.
The frames are not committed; `docs/site/review/goldens/hashes.json` is, and
the script exits non-zero and lists which goldens changed.

```bash
npx playwright install chromium   # once per machine — downloads a browser (~150MB)
npm run build
node scripts/goldens.mjs          # → docs/site/review/goldens/shots/, hashes.json
python scripts/sheets.py          # comp-vs-build sheets, needs `pip install pillow`
```

## Share image

`public/og.jpg` (1200×630, the `og:image` / `twitter:image`) is rendered from
the built site by `scripts/og-image.mjs` — the footer's robot mark, the hero
line and the brand gradient, in the page's own stylesheet — so it is never
hand-edited. After changing the mark, the gradient or the tagline:

```bash
npm run build
node scripts/og-image.mjs         # → public/og.jpg, then build again to ship it
```

---

## The preview harness

`preview/` renders the components with `react-dom/server` into plain HTML and
screenshots them at desktop and phone widths. It exists because this site was
built in an environment where `npm install` wasn't available, and it's handy
for eyeballing every section at once without scrolling.

```bash
./preview/build.sh
python3 -m http.server 8099 --directory preview/out
node preview/shoot.mjs      # → preview/shots/
```

It's dev-only. `npm run build` never touches it, and you can delete the folder
without consequence.

---

## Notes

- Every image has real `alt` text; decorative artwork is `alt=""`.
- The nav, contact menu and mobile menu all work from the keyboard, and the
  contact menu closes on `Escape` and on an outside click.
- The site is one HTML page plus three product pages; total JS is a few KB
  beyond React itself.
