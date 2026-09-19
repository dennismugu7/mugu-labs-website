# M5 — The hero's arrival, the brand marks, and the anchors

Instructions: `docs/site/lead/NEXT-006-hero-entrance-and-icons.md`, plus
`NEXT-007-push-what-exists.md` (the **Deployed** section at the end). In this
folder: `hero-entrance/` (six frames per viewport plus a contact sheet),
`social-row.png` (comp 9 / before / after), `sheets/09-…` (the re-framed
comp-9 frame). Hashes in `docs/site/review/goldens/hashes.json`.

## Outcome

**A: the hero rises on a CSS-only load animation, off the observer — headline
out of a clipped wrapper at 0–700ms, lead 200–800ms, button 320–870ms;
reduced motion turns it off entirely. B: Facebook and Instagram marks replaced
with Simple Icons path data (CC0), the "f" flush to the tile's bottom edge;
the other four checked — YouTube is the one worth a word. C: every anchor
target carries `scroll-margin-top: 6rem`; clicked in a real browser at 1920,
1366 and 390, each section lands with its top 23px below the nav and its
heading 100–320px clear; the harness offsets by the same value, read from the
CSS. D3: product pages read at document size. E: tiles a tile apart, principle
cards padded up. Zero build warnings, zero console messages, zero failed
requests. Mobile hashes moved on four frames, each attributed.**

## Commits this milestone

| sha | subject |
| --- | --- |
| `91b1814` | Commit NEXT-006, the lead's DECISIONS edits and the owner's social references |
| `d1631b2` | Commit the lead's PROTOCOL edits (the deploy rule) |
| _(next)_ | M5: hero entrance, brand marks, anchors clear the nav, document-size product pages |
| _(after)_ | M5: deployed section |

## Part A — the hero entrance

`components/Hero.tsx` no longer spreads `reveal()`; the three elements carry
`hero__rise` and the headline sits in a `hero__mask` wrapper. All CSS:

| Element | Keyframes | Duration | Delay | Ends |
| --- | --- | --- | --- | --- |
| `.hero__mask` | `hero-unmask` — `clip-path: inset(-0.4em -1em 0)` held with `step-end`, then `none` | 700ms | 0 | 700ms |
| `h1.hero__rise` | `hero-rise` — `translateY(105%)` + opacity 0 → rest | 700ms | 0 | 700ms |
| `.hero__lead` | `hero-rise`, 24px | 600ms | 200ms | 800ms |
| `.hero__cta` | `hero-rise`, 18px | 550ms | 320ms | 870ms |

The mask is open at the top and sides and closed at the bottom edge of the
headline's box, so the block rises up from behind that edge — the "rise up"
he described — and the clip is released in one step when the headline is in,
so the `text-shadow` is not cut off afterwards. The clip lives only in the
keyframe: a frozen page (the goldens), a reduced-motion page, or a page with
no CSS animation support is unclipped and fully visible. `hero-entrance/`
holds frames at 0, 150, 300, 450, 600 and 900ms, driven by pausing the Web
Animations and setting `currentTime`, so each frame is exact:
`desktop__contact-sheet.png` is the six in one image.

Reduced motion, measured (`reducedMotion: "reduce"` context): `#hero-title`
opacity 1, transform none, `animation-name: none`; mask `clip-path: none`;
zero `hero-*` animations in `document.getAnimations()`.

Hero goldens are byte-identical to M4 at every width, which is the right
result: the animation's end state is exactly the old reveal's end state.

**Per-line stagger without pinning the break** — the proposal, not shipped.
Wrap each line at runtime, not in the markup: after fonts load, walk the
headline's words with a `Range`, group by `getClientRects().top`, and wrap
each group in a `<span class="hero__line">`; re-run on resize past the gate.
Copy stays a plain string in `Hero.tsx`, the break stays the browser's, and
the wrapper spans get `animation-delay: calc(var(--i) * 90ms)`. Cost: it is
JS, so the stagger only exists once the script runs (the CSS block rise stays
as the no-JS/first-paint behaviour), and a wrapper swap after hydration can
flash on slow devices. It is about 30 lines in `lib/motion.ts`. I would not
add it unless the block rise looks flat to the owner.

## Part B — the marks

Both from Simple Icons 16.31 (CC0), path data inlined in `icons.tsx`, no
dependency (D1). Nothing traced from the reference PNGs (D18).

- **Facebook.** Simple Icons ships the current circle mark, with the "f" as
  the counter. I took that subpath — the brand's letterform — closed it along
  the bottom, and placed it as the square tile draws it: right of centre, flush
  to the bottom edge (`transform` on the path; the svg fills the tile for this
  one mark only). Proportions against the owner's reference: f width 0.49 of
  the tile (reference 0.47), top at 0.125 (0.125), bottom flush (flush).
- **Instagram.** Simple Icons' path, unchanged, drawn at 74% of the tile
  (was 52%) — the heavier camera filling more of the tile, as the reference.

`social-row.png`: comp 9, the M4 build, the M5 build.

**The other four, against comp 9:**

| | Verdict |
| --- | --- |
| X | Same mark. The comp's is drawn with an outline stroke (template rendering); the build's is the solid official glyph. Fine. |
| **YouTube** | **Off, in framing rather than geometry.** The YouTube mark *is* the red rounded rectangle with the white triangle, and comp 9 draws exactly that — a wide red tile with a triangle, no square. The build puts a white miniature of that mark inside a red square: a logo inside a logo. Geometry is right; framing is double. The fix would be a red tile at the mark's aspect (about 1.4:1) with a white triangle — a layout change in the row, so not done. |
| LinkedIn | Same mark; the comp draws it larger in its tile (~65% vs 52%). Minor. Simple Icons' LinkedIn is the filled square, which would not suit the tile treatment, so the current positive "in" stays. |
| Discord | Same mark; slightly larger in the comp. Minor. |

## Part C — anchors

`.section { scroll-margin-top: var(--anchor-offset) }` with
`--anchor-offset: 6rem` (96px) at root — every target is a `.section`. Nav is
73px from the top when stuck, so the section edge lands 23px below it and the
heading well below that (sections have their own top padding).

Verified by **clicking each nav link** in headless Chromium (the mobile menu
opened via its toggle first), then measuring where things landed:

| Target | 1920 — section top / heading clear of nav | 1366 | 390 (menu) |
| --- | --- | --- | --- |
| `#products` | 96 / 196 | 96 / 194 | 96 / 123 |
| `#journal` | 96 / 176 | 96 / 173 | 96 / 103 |
| `#about` | 96 / 175 | 96 / 174 | 96 / 320 |
| `#work` | 96 / 175 | 96 / 174 | 96 / 104 |
| `#contact` | 244 / 316 (page end) | 96 / 167 | 140 / 256 (page end) |

Nav bottom is at 73px in every case; `location.hash` was set on every click.
`#connect` has no nav link; it carries the same margin.

**Harness.** `targets()` now computes every section frame as
`top − scrollMarginTop` read from the element's computed style, so the goldens
show what a nav click shows and the offset has one source. The three laptop
products frames go through the same function. Comp 9 became two frames —
`09-how-i-work` anchored on `#work`, `09-socials` on `#connect` — since the
pair is 1252px tall and the old bottom-aligned frame is what clipped the
heading; sheet 09 maps to the first. And the script now clears `shots/` before
a run, because a retired frame was otherwise hashed as "unchanged".

## Part D3 — product pages at document size

Inside the ≥1280 block, `.detail` resets `--u` to `1rem` and `--fs-lead` /
`--fs-body` to their base clamps. At 1920 the summary is 22.4px, feature copy
18px, buttons 56px — what the home page had before M4 — while the home page
keeps its scale. `desktop__products-detail` is the only page-level frame that
moved for this reason.

## Part E — tiles and cards

`.socials` gap in the block: `clamp(1.5rem, 8.3vw − 82px, 5rem)` — 24px at
1280 (continuous with the base), **77px at 1920** (comp 9: tiles ~80px apart).
The tiles themselves stay 92px; I measured comp 9's at ~80, so it was the
spacing, not the tile, that read small. `.principle` padding
`calc(2.1 * var(--u))`: 34px → **45px** at 1920.

## The hash table

Against the M4 baseline. 29 goldens (two retired, four new).

| Golden | | Why |
| --- | --- | --- |
| `desktop__01-hero`, `laptop*__01-hero`, `mobile__01-hero` | same | entrance ends where the reveal ended |
| `desktop__02-03-products`, `laptop*__02-03-products` | **changed** | anchor offset (frame starts 96px higher) |
| `desktop__04`, `desktop__05` | same | statements untouched |
| `desktop__06-07-journal` | **changed** | anchor offset |
| `desktop__07-journal-cards` | same | anchored on the grid, not the section |
| `desktop__08-about` | **changed** | anchor offset |
| `desktop__09-how-i-work-and-socials` | **retired** | replaced by the two below |
| `desktop__09-how-i-work`, `desktop__09-socials` | new | |
| `desktop__10-contact-and-footer` | **changed** | social tiles in frame: marks and gap |
| `desktop__contact-menu` | **changed** | same frame as 10 |
| `desktop__products-detail` | **changed** | document-size scale |
| `desktop__reduced-motion` | **changed** | full page: marks, gap, padding |
| `mobile__02-03-products` | **changed** | anchor offset |
| `mobile__06-07-journal` | **changed** | anchor offset |
| `mobile__08-about` | **changed** | anchor offset |
| `mobile__09-how-i-work-and-socials` | **retired** | |
| `mobile__09-how-i-work`, `mobile__09-socials` | new | |
| `mobile__10-contact-and-footer` | **changed** | the YouTube tile is in the top 114px of this frame — marks changed |
| `mobile__04`, `mobile__05`, `mobile__nav-open` | same | |

Mobile, then: three frames moved because they start 96px higher (Part C, the
harness half), one because the marks changed (Part B). No mobile frame moved
for Part A (frozen end state identical), Part D3 or Part E (both gated).
Nothing unattributed. Two runs of the final build: identical.

## Deviations

1. Comp 9 is two frames now, and the M2 `INDEX.md` note about bottom-aligning
   it is superseded.
2. `goldens.mjs` clears `shots/` at the start of a run.
3. The `.detail` scope also sets `font-size: var(--fs-body)` on the article,
   so inherited copy picks up the reset — a custom property redeclared on a
   descendant does not re-resolve the root's `--fs-body`.

## Questions for the lead

1. YouTube's framing (Part B table). Fix it as the red wide mark, or keep the
   uniform square tiles for the row's rhythm? Comp 9 does the former.
2. Per-line stagger: the runtime-wrapping proposal above — want it?

## Deployed

Per `NEXT-007` and the new `PROTOCOL.md` rule.

- **Pushed:** `b3cdee4..d18b283` (`main → origin/main`, 9 commits: all of M3,
  M4 and M5). After the push `git rev-parse main origin/main` both read
  `d18b283`.
- **CI:** <https://github.com/dennismugu7/mugu-labs-website/actions/runs/35457845513>
  — success.
- **Vercel:** <https://mugu-labs-website.vercel.app/> served the new build
  about 20s after the push (`X-Vercel-Id: cpt1::…`). Fetched the hosted page
  and its stylesheet, not `out/`:

| Check | Live |
| --- | --- |
| "A one-person studio" (hero eyebrow, cut in M3) | **absent** (0 matches) |
| "Short notes on what" (journal subtitle, cut in M3) | **absent** (0 matches) |
| About heading light | `class="section-title about__title"` present; `.about__card{…background:var(--navy)…}` in the served CSS |
| Contact backdrop returns to blue | `data-tint-release` on `#contact` present |
| M4 / M5 markers | `--u:` ×3, `min(1400px`, `scroll-margin-top`, `--anchor-offset`, `hero-rise`, `hero-unmask` all in the served CSS; `social--facebook` with the `translate(9.6 3)` glyph in the HTML |

The hosted `index.html` and the local `out/index.html` are the same document
once Next's build ids, chunk hashes and inline scripts are normalised (zero
differing lines). Not a deployment problem.

- **B11, seen live:** `og:url` on the hosted page is `https://mugu-labs.com/`,
  as the lead found. Untouched; next milestone.

## NEXT-008 — the production URL, and what I actually fetched

### 1. The exact URL I fetched for the M5 check, verbatim

```
curl -sL https://mugu-labs-website.vercel.app/
curl -sL https://mugu-labs-website.vercel.app/_next/static/css/e5a63792c66ff97b.css
curl -sI https://mugu-labs-website.vercel.app/
```

From this machine, in a poll loop every 20s starting at 17:23 UTC, until the
body contained `hero__mask` — which it did on the second poll (17:24 UTC).
The production hostname, no deployment URL, no `localhost`. The `X-Vercel-Id`
in the M5 report (`cpt1::…`) is from that fetch: the Cape Town edge.

### 2–4. The production hostname, cache-busted, with headers — 17:32 UTC

```
GET https://mugu-labs-website.vercel.app/?v=next008
HTTP/1.1 200 OK
Age: 0
Cache-Control: public, max-age=0, must-revalidate
Content-Length: 55149
Etag: "88d2d9641fb31c72c5650ed103cadfc2"
X-Vercel-Cache: MISS
X-Vercel-Id: cpt1::kgkzh-1789839147604-e016b3b32134
```

| In the body | Count |
| --- | --- |
| "A one-person studio" | **0** |
| "Short notes on what" | **0** |
| `hero__mask` | 1 |
| `section-title about__title` | 1 |
| `data-tint-release` | 1 |

`MISS` with `Age: 0` — that is the origin, not a CDN copy, and it is the M5
document. Then the same URL with the lead's own query string,
`?cachebust=m5`, four more times across two user agents (curl and a
Chrome UA): every response `Etag "88d2d964…"`, `Content-Length 55149`,
eyebrow 0, subtitle 0, `hero__mask` 1, Next build id `oO2JpQxAkLABeyYSwK76D`
(the Vercel build of `d18b283`). Then the no-query URL, then forced IPv4 and
forced IPv6 (DNS gives `64.29.17.131` and two `64:ff9b::` addresses): same.
Then the three `Accept-Encoding` variants a browser sends — identity, gzip,
br — because an edge cache is keyed on encoding and a stale brotli copy is a
real way for two clients to see two sites: all three the same weak etag,
same M5 body.

Because every one of those goes through the same edge (`cpt1`), I also
fetched the production hostname through a US-hosted reader proxy
(`r.jina.ai`, which fetches server-side from its own network):
`?v=jina1` → HTTP 200, no "one-person studio", no "Short notes on what".

**The stylesheet the hosted page links**
(`/_next/static/css/e5a63792c66ff97b.css`, `Cache-Control: immutable`,
`X-Vercel-Cache: MISS`): `--u:` ×3, `scroll-margin-top` ×1, `hero-rise` ×2,
`hero-unmask` ×2, `min(1400px` ×1, `--anchor-offset` ×2. CSS and HTML are
from the same build — this is **not** the new-CSS-old-HTML case.

The hosted document and `out/index.html`, normalised for Next's build id,
chunk hashes and inline scripts: **0 differing lines**.

### What that means

From two vantage points, every cache-busting variant, both IP families and
all three encodings, `https://mugu-labs-website.vercel.app/` serves the M5
build and has since 17:24 UTC. The production alias is pointed at `main`'s
latest build and the Git integration is promoting — the suspicion in NEXT-008
is killed for this project, at least as seen from here.

So I cannot reproduce the M2 document the lead is getting, and I have no
fetch that returns it. The remaining candidates are all on the lead's side of
the wire, in order of likelihood: (1) the tool's own 15-minute cache keyed on
host + path, so `?cachebust=m5` does not miss it (the first fetch was made
before 17:24 and primed it; the second hit the primed copy); (2) an
intermediate proxy between the tool and Vercel doing the same; (3) a fetch of
a different hostname than the one written down. What would settle it in one
line: the `Etag`, `X-Vercel-Id` and `Age` from the lead's own response — if
the etag is not `88d2d964…` (or `c4ffeb06…` after Part B, below), the two of
us are being served different documents and the `X-Vercel-Id` says by which
edge; if there are no Vercel headers at all, the response never reached
Vercel.

Not touched: the Vercel dashboard, per the brief.

### Part B — YouTube

The glyph is now the play triangle alone: the triangle subpath from Simple
Icons' youtube mark (CC0, 16.31), scaled to 14 units on the 24 box and kept
at the mark's own slightly-right-of-centre position, drawn at 70% of the
tile. Tile colour and radius unchanged. `social-row.png` regenerated (comp 9 /
M4 / now). Six goldens moved, all frames that show the row:
`desktop__09-socials`, `desktop__10`, `desktop__contact-menu`,
`desktop__reduced-motion`, `mobile__09-socials`, `mobile__10`. Nothing else.

### Deployed (NEXT-008)

- **Pushed:** `45300b6..7b46697` (`347c36a` the lead's files, `7b46697` the
  YouTube glyph). `main` = `origin/main` = `7b46697`.
- **CI:** <https://github.com/dennismugu7/mugu-labs-website/actions/runs/35458659212> — success.
- **Fetched, verbatim:** `curl -sS -D - https://mugu-labs-website.vercel.app/?v=next008-b`
  at 17:38:09 UTC, 15s after the push, HTTP 200:

  ```
  Age: 0
  Content-Length: 54809
  Etag: "c4ffeb06fa4df0a16dd8129818caa8c1"
  X-Vercel-Cache: MISS
  X-Vercel-Id: cpt1::tgdd6-1789839489156-46349a9ab5db
  ```

  Body: "A one-person studio" 0, "Short notes on what" 0, `hero__mask` 1,
  the Facebook glyph transform `translate(9.6 3)` 1, the YouTube triangle
  transform `translate(12.4 12)` 1, Next build id `YqeOwLZcRP5FQHDsz8H18`.
  Against `out/index.html`, normalised: 0 differing lines.

## NEXT-009 — B6, the share image

### What was built

`scripts/og-image.mjs` (Playwright, like the goldens): serves `out/`, opens
the built home page at 1200×630, removes `main`, nav and footer, keeps the
backdrop at `--tint: 0` (the blue) and the stylesheet, and appends a card made
of the footer's own robot SVG, the `.brand` wordmark text, the `#hero-title`
text in the page's `.display` class, and the `og:url` hostname. One source of
truth: change the mark, the gradient or the tagline in `lib/site.ts`, rebuild,
re-run, and the card follows. Output `public/og.jpg`, 1200×630, **72KB** (the
same frame as PNG is 780KB — gradient plus grain does not compress — and
every crawler that reads `og:image` reads JPEG).

`app/layout.tsx`: one `shareImage` object (`/og.jpg`, 1200, 630, alt
"Mugu labs — Neat apps with a human touch") in both `openGraph.images` and
`twitter.images`; `metadataBase` turns it absolute. The built page carries
`og:image`, `og:image:width/height/alt` and `twitter:image` plus its
width/height/alt. README has a *Share image* section.

### Verified

- **Pushed:** `2216b95..42eed4c` (`2216b95` the lead's NEXT-009 and PROTOCOL
  edit, `42eed4c` B6). `main` = `origin/main` = `42eed4c`.
- **CI:** <https://github.com/dennismugu7/mugu-labs-website/actions/runs/35459612122> — success.
- **Fetched, verbatim:** `curl -sS -D - https://mugu-labs-website.vercel.app/?v=next009`
  at 17:57:13 UTC, 15s after the push — HTTP 200, `Age: 0`,
  `X-Vercel-Cache: MISS`, `Etag "ae5f4062…"`, `X-Vercel-Id: cpt1::nw866-…`.
  Body: `<meta property="og:image" content="https://mugu-labs.com/og.jpg"/>`
  and `<meta name="twitter:image" content="https://mugu-labs.com/og.jpg"/>`.
- **The image, from the production hostname:**
  `https://mugu-labs-website.vercel.app/og.jpg?v=1` → 200, `image/jpeg`,
  73,376 bytes, decodes as 1200×630 JPEG, **byte-identical to
  `public/og.jpg`**.

**One thing to say loudly, and it is B11, not B6.** The tag's absolute URL is
`https://mugu-labs.com/og.jpg`, because `metadataBase` is `site.url`. That
host resolves (`34.111.179.208`) and answers **404** today — for `/` and for
`/og.jpg`. So until the domain is attached, a crawler reading the Vercel
page finds an `og:image` it cannot fetch, and link previews show no image.
This is exactly the `og:url` situation already on record, one tag wider, and
the fix is the same one with no code change: the domain arrives, both become
correct. Per NEXT-009 I have **not** pointed `site.url` at the Vercel URL. If
the owner wants previews working before the domain is attached, that is the
one-line decision to make, and it is his.

### Goldens

Two runs on this build. Between them, and against the previous run, the
frames were byte-identical except one at a time of `desktop__06-07-journal`
and `desktop__08-about`, which alternated by **at most 44 pixels, none
differing by more than 8/255, all inside a 22×2px patch at (303–325, 26–28)**
— the nav's brand mark, under the stuck nav's `backdrop-filter` blur.
Nothing in this commit touches the page body; the metadata is in `<head>`.
That is a compositor-level flake in the blur, not a change, and it is the
first run-to-run instability the harness has shown since M2. Noted here so
the next "one desktop hash moved" is not chased as a regression; if it
recurs, the fix would be to compare with a tolerance rather than byte
equality, which I have not done.

### B8 — an opinion, since you asked

**No linter, for now. Two compiler flags instead.**

What a linter would catch here that nothing else does: unused imports and
variables, and the two React hooks rules (`rules-of-hooks`,
`exhaustive-deps`). The codebase has three components that use hooks
(`Nav`, `ContactChoice`, `Motion`), fifteen files, one author, `strict: true`
and `tsc --noEmit` in CI. Everything else `eslint-config-next` brings — the
`@next/next` rules, `jsx-a11y` — is either already satisfied or is caught by
the build (Next's compiler already warned on the one `<img>` rule, and the
comments disabling it are in the source).

What it would cost: ESLint 9's flat config, `eslint-config-next` and its
plugin tree (≈100 packages), the `next lint` → `eslint` CLI migration that
Next 15.5 has already started and Next 16 finishes (B9), and a config to keep
in step with both. For one author on fifteen files that is more machinery
than defect.

The two things worth having are free: `"noUnusedLocals": true` and
`"noUnusedParameters": true` in `tsconfig.json`. I ran the compiler with both
flags on the current tree — it passes clean — so they cost nothing today and
fail the build the day an import goes stale. That leaves `exhaustive-deps`
uncovered, and I would accept that: the three effects in the codebase are
`[]`-dependency mount effects, reviewed by hand.

Revisit when any of these becomes true: a second contributor, the hooks
count doubles, or Next 16 lands and the ESLint story is settled. Until then
the goldens are the regression suite that matters for this site, and they
already fail loudly.

Not applied — B8 says decide first. It is two lines in `tsconfig.json` when
you say so.
