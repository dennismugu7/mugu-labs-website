# M2 — Verify the build against the comps

Instructions: `docs/site/lead/NEXT-002-push-and-verify.md`. Screenshot index:
`INDEX.md` beside this file. Ten sheets in `sheets/`, twenty goldens in
`shots/`, numbers in `capture-log.json`.

## Outcome

**M1 is closed: pushed, CI green. Part B done, build warnings 1 → 0. Part C
done: 10 sheets, 20 byte-stable goldens, zero console errors, zero failed
requests. B2 done: fonts are woff2, 66KB → 32KB, goldens unchanged.** The build is structurally faithful to every comp. The drift is
almost all *scale*: the comps are slide-sized and the build is web-sized, and
the difference is consistent (roughly 0.65×) rather than random. One thing is
plainly wrong — the "Made by a human" heading weight. One thing is a real
call for you — comp 10 goes back to blue and the build stays violet.

Nothing visual was changed. All of it is in the table below.

## Commits this milestone

| sha | subject |
| --- | --- |
| `3e407e5` | M1: push and CI confirmed; commit NEXT-002 and the lead's backlog edits |
| `d50f94f` | Housekeeping from NEXT-002 Part B: Node 24, .gitattributes, flex-end |
| `5630f41` | M2: goldens and contact sheets against the design comps, with report |
| _(next)_ | B2: fonts shipped as woff2 |

## Part A — M1 closed

Push and CI section appended to `review/M1/REPORT.md`. Run
<https://github.com/dennismugu7/mugu-labs-website/actions/runs/35445664573>,
success, every step green. A2 answered by that run: typecheck ran before build
on a clone with no `next-env.d.ts` and passed.

## Part B — housekeeping

| Item | Done | Verified |
| --- | --- | --- |
| `align-items: end` → `flex-end` (`globals.css:614`) | yes | Build warnings **1 → 0**. Clean rebuild output below. |
| `.gitattributes` `* text=auto eol=lf` | yes | `git add --renormalize .` changed nothing (index was already LF). Fresh clone from GitHub on this machine: `git status --porcelain` empty, `preview/build.sh` and `README.md` checked out LF. |
| Node 24 | `.nvmrc` = `24`; CI `node-version: 24`; `netlify.toml` `NODE_VERSION = "24"`; `engines.node` `>=20.19.0` | Local build on 24.19.0 (below). CI on 24: see the run for commit `d50f94f`. |

Build after Part B (clean `out/` and `.next/`):

```
> mugu-labs@1.0.0 build
> next build

   ▲ Next.js 15.5.25

   Creating an optimized production build ...
 ✓ Compiled successfully in 4.2s
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (9/9)
   Finalizing page optimization ...
   Collecting build traces ...
 ✓ Exporting (2/2)
BUILD EXIT=0
```

**Vercel and Node 24**: not checked — that is an owner action I have not
touched. Vercel does offer 24.x as a project Node setting as of this year; if
the import defaults to something older, the site still builds (it builds on
20 in the first CI run), so it is a settings change, not a blocker.

## Part C — the comparison

### How it was captured

`scripts/goldens.mjs` (Playwright, Chromium) serves `out/`, freezes every CSS
animation, scrolls the page once so every reveal has fired, then goes to each
target and waits 1.1s. Pinned statements are captured at
`top + (height − viewport) × 0.5`. `scripts/sheets.py` (Pillow) makes the
sheets. Details and per-file notes in `INDEX.md`.

Two things in the capture had to be fixed before the goldens were honest, both
worth knowing about for later:

1. **The page has `scroll-behavior: smooth`.** `window.scrollTo(0, y)` glides,
   so a warm-up loop with short pauses never actually reached its targets and
   most reveals never fired. Every programmatic scroll in the script now passes
   `behavior: "instant"`. Before that fix the "socials" row was blank in the
   comp-9 golden — a false alarm, not a bug.
2. **Full-page captures and a fixed backdrop.** Playwright paints
   `position: fixed` only for the first viewport of a full-page shot; the rest
   came out flat navy. For the three full-page shots the backdrop is stretched
   over the document at capture time. The page is untouched.

Two full runs → all 20 goldens byte-identical.

### Comp → build, one line each

| Comp | Verdict | What differs, and which way |
| --- | --- | --- |
| 1 Hero | **minor drift** | Structure and copy match. Comp headline ≈150px / 3 lines, left edge at 108px, full-bleed; build 102px / 2 lines inside a centred 1180px column (`--shell`). Build adds an eyebrow ("A ONE-PERSON STUDIO") and a "SCROLL" hint that are not drawn. Comp's gradient reaches a bright cyan in the bottom-right corner; the build's stays a deeper blue. |
| 2 Products A | **minor drift** | Same cards, same copy, same button colours. Comp cards ≈810px wide with 440px icons; build cards 370px with 160px icons — the 3-up grid (D3) costs about half the scale. Build adds a section heading ("Three apps, each doing one job properly") and LIVE / IN BUILD status pills, neither drawn. |
| 3 Products B | **minor drift** | As comp 2 — ODA card in the same grid. |
| 4 Statement "overload" | **match** | Centred, light weight, one line. Comp ≈100px, build 70px — the same 0.7 ratio as everywhere else. |
| 5 Statement "breather" | **match** | Two lines, same break. Comp text is left-of-centre; build is centred. Same size ratio. |
| 6 Journal CTA | **minor drift** | Per D4 this is the journal heading. Comp: one line, left-aligned, with the navy pill. Build: two lines, centred, subtitle added, pill moved to below the cards (where it sits below the 1080 frame — visible in `desktop__reduced-motion`). |
| 7 Journal cards | **minor drift** | Art does break above the card top as drawn ✓. Comp cards ≈520px with ≈480px art; build 370px with ≈250px art. **Tag pills wrap differently**: comp has two per row ("Dashboard X" + "Smart Moves & Quick Hacks"), build stacks one per row because the card is narrower. |
| 8 About | **wrong** (one thing) | Layout, copy, bio card, author chip, tape-measure art all as drawn. But **the heading is bold (700) in the build and light (300) in the comp** — `.about__title` uses `.display`, which is the hero weight. Everything else on the page that looks like this heading ("How I work", "Let's stay connected") is light in both. The card's fill is solid navy in the comp, translucent in the build. |
| 9 How I work + socials | **minor drift** | Three cards, six icons, all glyphs present. Comp cards ≈500px with ≈24px body; build 370px with 17px body and adds "01 / 02 / 03" numerals not drawn. Comp icons ≈90px widely spaced; build 64px tight. Violet backdrop ✓. |
| 10 Contact + footer | **minor drift** — plus one call for you | Card, envelope, copy, mint button, robot mark, copyright all present. Scale again: comp button ≈480×90, build 210×50; mark ≈170px vs 60px; copyright ≈28px vs 12px. Build adds a footer link row not drawn. Comp has a faint photographic texture (a hand and a network diagram) behind the card — the build has grain only. **And the comp is blue, not violet**: only comp 9 is violet; comp 10 returns to the blue of 1–8. The build's tint anchors on `#work` and never comes back (D5 says "blue → violet", nothing about back). |

### The pattern

Every "minor drift" above is the same drift. The comps put one idea per
1920×1080 slide and size it to fill; the build puts everything in a 1180px
column and sizes type with `clamp()`, so at 1920 wide the build renders at
about 0.65–0.7× the comp's scale, consistently. Cards are narrower because
three of them share a row that held two (or one) in the comps.

Whether that is the build being wrong or the comps being slide-shaped is
yours to decide, but it is one decision, not ten: either the column gets
wider / type gets a larger top clamp on big screens, or the comps' scale is
accepted as a slide artefact. I would not fix the ten rows individually.

### Things that are not in any comp

Added by the build, listed so nothing is hidden: nav bar (D2, deliberate),
hero eyebrow, hero scroll hint, products heading, product status pills,
journal subtitle, principle numerals, footer link row. All small. Whether each
stays is a scope-rule call; none were drawn.

### C4 checklist

| Check | Result |
| --- | --- |
| Scale | See "the pattern". Hero headline is 197px tall in a 1080 frame (18%); in the comp it is ≈360px (33%). Not oversized — undersized, consistently. |
| Type | Poppins resolves everywhere (`fontFamily` reads `Poppins` on every measured element). Weights: 700 hero, 300 section titles and statements, 700 card titles — all as drawn except comp 8 (above). Line counts differ from comps on hero (2 vs 3) and journal heading (2 vs 1), both from the column width. |
| Glyphs | All six social icons, both arrows, the GitHub mark in the author chip, the robot mark in nav and footer: present, no empty boxes. |
| Gradient | No visible banding at 1x or 2x (the grain layer is doing its job). Blue → violet: no hard edge; it is a cross-fade over one viewport around `#work`. |
| Glass | `backdrop-filter` supported and active in the capture browser. Cards read as translucent over the gradient; the nav gains its blur once scrolled (visible in every non-hero shot). |
| 3D art | Journal art breaks above the card top, not clipped, not over the titles — at both widths. |
| Mobile | No horizontal overflow (`scrollWidth === innerWidth` at 390). Gutter is 18px (`--gutter` under 960px; the `gutterPx: 0` in the log measured the shell's edge, not its padding — ignore it). Nav collapsed to a button; panel opens as a dropdown list. Socials **3 × 2** ✓. Hero title 48px / 3 lines. The hero is 602px tall at 390×844 — it does not fill the first screen; the products eyebrow shows at the bottom of the first frame. |
| Console | 0 errors, 0 warnings, 0 failed requests, 0 HTTP ≥ 400 — on `/`, all three product pages, `/404.html`, both viewports. |

One more, found by the capture rather than the checklist: at 1920×1080, with
the bottom of the socials section aligned to the bottom of the frame, the six
icons are 4px short of the reveal observer's trigger line (`rootMargin` −12%,
threshold 8%). A visitor who stops scrolling exactly there sees the heading
and no icons until they move 5px more. Real but tiny; noted, not fixed.

## Deviations

1. **Two new scripts in `scripts/`**: `goldens.mjs` and `sheets.py`. The lead
   asked for the artefacts, not the tooling, but goldens that double as
   regression tests need a repeatable way to make them. `playwright` is **not**
   in `devDependencies` — D1 says no dependency without a question, so this is
   the question (below). Locally it runs from a junction into a scratch
   install; nothing in `package.json` or the lockfile changed.
2. **Comp 9 framing**: bottom-aligned rather than top-aligned, because the two
   sections are 41px taller than a frame and the socials are the part that
   matters. Recorded in `INDEX.md`.
3. **The `--tint`/full-page backdrop stretch** for three shots, as above.
4. **Repo weight**: `shots/` is 43MB (gradient + grain does not compress) and
   `sheets/` 6MB. Every future capture round adds the same again. Question
   below.

## Questions for the lead

1. **The scale decision** — one call, see "the pattern". If the answer is
   "match the comps", the levers are `--shell` (1180px) and the top of the
   three `clamp()`s (`--fs-display` 6.4rem, `--fs-section` 5rem,
   `--fs-statement` 4.4rem), plus the 3-up grid's card padding.
2. **Comp 8 heading weight** — 300 as drawn, or 700 as built? I think drawn.
3. **Comp 10 backdrop** — return to blue after the violet section, as drawn,
   or stay violet? Staying is one fewer transition on a phone; returning is
   what the comp says.
4. **Playwright**: add to `devDependencies` so `scripts/goldens.mjs` runs from
   a clean clone, or keep it out and treat the goldens as a lead-review
   artefact only? It is ~3 packages plus a 150MB browser download on first
   run; it does not touch `dependencies`.
5. **43MB of goldens per round** in git. Options: keep (simple, review history
   in one place); or capture at 1x for mobile too; or keep only the sheets in
   git and the goldens in the CI artefact store. Your call — I would keep
   them for M2/M3 and reconsider once the visual work settles.
6. The undrawn additions list — anything you want cut before M3?

## Questions only the owner can answer

- **The photographic texture behind the contact card in comp 10** (a hand and
  a network diagram): is that a real asset he has, or a stock placeholder in
  the slide? If it is not his, the build should not chase it.

## Checked on the real machine

All of it. The one thing not done in a real, headed browser is the
`backdrop-filter` check — the capture browser reports support and the shots
show blur, which is the same engine Chrome uses; Safari and Firefox were not
tested this milestone.

## B2 (woff2) — done

`pip install fonttools brotli` (fonttools 4.65.0, brotli 1.2.0), then
`python scripts/build-fonts.py --woff2`. Four files, 7.8–7.9KB each:
**66KB → 32KB** of fonts. `styles/fonts.css` now points at `.woff2` with
`format("woff2")`; the `.ttf` copies are removed from `public/fonts/`; README's
*Fonts* section rewritten to describe what ships. `out/` is now 2,468,550
bytes (was 2,503,509).

Proof it renders identically: after the swap, a fresh build and a fresh
capture produced **all 20 goldens byte-identical** to the committed ones. If
the woff2 had failed to load, the fallback face would have changed every
pixel of text. 0 console messages, 0 failed requests.

`DECISIONS.md` D6 still says "~65KB total" — yours to update, I do not edit
that file.
