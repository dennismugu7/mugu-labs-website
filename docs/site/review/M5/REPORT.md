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
