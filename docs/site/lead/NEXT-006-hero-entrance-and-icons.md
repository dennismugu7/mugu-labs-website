# NEXT-006 — The hero's arrival, two wrong logos, and an anchor bug

Milestone: **M5**. Append-only.

**M4 accepted.** `--u` is the right answer and better than what I asked for —
one token, every in-scope rule sized off it, bit-identical below 1280 and
continuous above. All nine mobile hashes unchanged is the proof, and this time
the criterion was clean. The fluid shell holds 70px at 1279/1280/1366/1440/1500
with no step. I reviewed sheets 09 and 10: the contact card, footer mark and
copyright now sit where the comp puts them, and the backdrop is blue as drawn.

Committing my D14–D16 edits separately so the M4 diff was only M4 — exactly
right.

---

## Part A — owner request: the hero should rise in, not appear

His words: *"the welcome words 'neat app…' should have the dynamic animation
feel of rise up or something — not a static text that appears suddenly."*

He is describing a real defect, not a preference. The hero currently uses the
same `[data-reveal]` IntersectionObserver path as every other section, and for
the hero that is the wrong mechanism twice over:

1. **It is already in view at load.** The observer fires as soon as JS
   hydrates, so the class lands in or near the same frame as first paint and
   the transition frequently is not seen at all. The text just appears —
   precisely what he is reporting.
2. **It gives the hero no arrival of its own.** The one screen that should
   introduce the studio gets the same generic treatment as a card three
   sections down.

**Fix: the hero gets a CSS-only load entrance, off the observer entirely.**

- Take the hero elements out of `[data-reveal]`.
- `@keyframes` rise: translateY plus opacity, `animation-fill-mode: both`, with
  a stagger — headline, then sub, then button. Keep the whole sequence under
  about 900ms; this should feel like an arrival, not a wait.
- Put the headline behind a **clip mask** — a wrapper with `overflow: hidden`
  so the line rises up from behind an edge rather than fading in place. That
  masked rise is what reads as "rise up"; opacity alone will not.
- Because it is a CSS animation and not a JS class toggle, it runs without the
  script, cannot land in the same frame as paint, and needs no `no-js`
  fallback.
- `prefers-reduced-motion: reduce` → no transform, no animation, visible
  immediately. This is in the existing reduced-motion block; make sure the new
  rules are covered by it.

**Animate the headline as one block, not per line.** Per-line stagger would
look better, but it needs the three lines wrapped in spans, which hardcodes the
break into the markup — and the break is only deterministic at ≥1280. Copy
should stay editable without touching layout. If you find a way to stagger
lines without pinning the break, propose it in the report rather than shipping
it.

The two pinned statements keep their current scroll-driven treatment. This is
about the hero only.

## Part B — owner request: the Facebook and Instagram marks are wrong

He is right, and comp 9 backs him up — the correct marks are in the comps as
well as in his references.

I have put his references in the repo at `docs/site/ref/social/`:

- `facebook-correct.png` — note the "f" is **flush to the bottom edge** of the
  tile. The build's is centred with padding, which is the tell.
- `instagram-correct.png` — a heavier camera glyph filling more of the tile
  than the build's, with the lens and the top-right dot at the reference's
  proportions.
- `live-site-current.png` — the deployed row, for comparison.

**Source the replacements properly. Do not trace them from those PNGs.** Take
the official marks from the brands' own brand-asset pages, or from a CC0 set
that tracks them (Simple Icons is the usual one) and inline the path data —
no dependency, so D1 holds. Keep the coloured tile and the white glyph as the
comps draw them; only the glyph geometry and its framing change.

While you are in `icons.tsx`, sanity-check the other four against comp 9 at the
same level of attention. If one of them is also off, say so.

## Part C — an anchor bug the M4 sheets exposed

Sheet 09's build frame has "How I work" clipped under the nav, and sheet 10
does the same to "Let's stay connected". You logged this as a capture-framing
question. It is that — **and it is also a real site bug**.

The nav is `position: fixed`. Clicking "How I work" in it jumps to `#work`,
which puts the section top at viewport top — underneath the nav. The heading
lands behind the bar for every visitor who uses the navigation.

Two separate fixes:

1. **The site.** `scroll-margin-top` on every anchor target — `#products`,
   `#journal`, `#about`, `#work`, `#connect`, `#contact` — at least the nav's
   height plus breathing room. Verify by clicking each nav item, not by reading
   the CSS.
2. **The harness.** Section captures should offset by the same amount so a
   heading is never clipped in a golden. Make it uniform in `goldens.mjs`, not
   a per-frame nudge.

Both mobile and desktop.

## Part D — your three questions

**1. Tag pills, two-per-row only from 1440.** Accept your recommendation, and
your reasoning is the right reasoning: comp 7 draws them in a 520px card, and
at 360–387px two long pills cannot sit side by side without dropping type below
legibility. A card that cannot hold the comp's arrangement should stack
honestly rather than shrink text to fake it. Leave it.

**2. Frame 07 and the 1080 frames generally.** Accept the new
`desktop__07-journal-cards` frame. The comps are 1080 slides; when a section
outgrows that, capturing it scrolled is the honest comparison and pretending
otherwise is not. Frame 09's clipping is fixed by Part C.

**3. `--fs-body` at 22px inheriting into the product pages.** Good that you
said it out loud — it is in scope by the letter and wrong in spirit. 22px over
a wide measure is poster text, and a product page is a document. Scope a
smaller `--u` to `.detail` so those pages read at a document size while the
home page keeps its poster scale. Acceptance: at 1920 the product page body
reads like something you would read, not something you would glance at.

## Part E — observations, not tasks

From sheet 09, after your scaling: the social tiles and the gaps between them
are still noticeably smaller and tighter than comp 9 draws them, and the
principle cards carry less internal padding than the comp. Both are close
enough that I am not opening another round — but if Part B has you in that
section anyway, bringing the tiles and their spacing up is welcome.

## Report

`docs/site/review/M5/REPORT.md`, plus:

- a short capture of the hero entrance — three or four frames across the
  animation, so I can see the rise rather than read about it
- the social row before and after, against comp 9
- each nav anchor verified as landing clear of the nav, at both widths
- mobile hashes: Parts A, B and C all touch ungated surfaces, so mobile
  **will** change this time. That is expected. Attribute each one.

## Still outstanding from the owner

He confirmed he holds `mugu-labs.com`, so `BACKLOG.md` B11 is now a real task
rather than an open question — attaching the domain and fixing `site.url` is
the next milestone after this one.

He meant to paste the Vercel URL and did not. I have asked again.
