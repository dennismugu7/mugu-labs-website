# M3 — Scale, fidelity, and the proof

Instructions: `docs/site/lead/NEXT-003-scale-and-fidelity.md`, resumed per
`NEXT-004-resume-and-verify.md`. Six sheets in `sheets/` (01, 02, 07, 08, 09,
10). Goldens are not committed from this milestone on (D13): the record is
`docs/site/review/goldens/hashes.json`, numbers in
`docs/site/review/goldens/capture-log.json`.

## Outcome

**Part A verified: at 1920 the hero headline is three lines with a cap height
of 95px against the comp's 99px (−4%). The 1280px gate did not leak — proven
by a build with the block removed, not by looking. Part B (B1, B2, B3) and
the reveal line are in the goldens. Zero build warnings, zero console
messages, zero failed requests. Three runs, two builds, all 20 original
goldens byte-identical across them.**

Four things fell out of Part A that neither of us had seen. None are broken;
all are yours to call (below, "What Part A shook loose").

## Commits this milestone

| sha | subject |
| --- | --- |
| `2a3c1f8` | M3: scale for large screens, about heading weight, solid bio card, tint release — the work from the session that closed, committed before anything was built |
| _(next)_ | M3: verified — new hash baseline, 1366 golden, sheets, report |

## Resume

`git status` showed 13 modified files and the untracked `goldens/` and
`NEXT-004`. Nothing was checked out, reset, stashed or cleaned. The commit
carries everything NEXT-004 lists as done, plus three things the table did not
mention that were also on disk: the hero eyebrow cut, the journal subtitle cut
(both from NEXT-003 Part C, "Cut") and `data-tint-release` on `#contact`.
`hashes.json` went in as the M2 baseline, so the before-picture is in history
at `2a3c1f8` and the after-picture is the next commit.

## Build

`npm install` (Playwright 1.63 pulled in, `npx playwright install chromium`
run once). `npm run typecheck`: clean. `npm run build`: **0 warnings**, same
route table as M2, first-load JS unchanged at 103–108kB.

One hiccup, not a bug: the first `goldens.mjs` run after `npm install` died
with "serve did not start" — the 15s poll expired before the freshly
installed `serve` answered. The same command worked on the next try and every
run since. If it recurs on a clean machine, the poll is the thing to lengthen.

## The hash comparison — Part A as a pass/fail test

Baseline: M2 frames (committed at `2a3c1f8`). Current: this build, three
runs identical.

| Golden | M2 | M3 | |
| --- | --- | --- | --- |
| `desktop__01-hero.png` | `11abc173…` | `05921110…` | **changed** |
| `desktop__02-03-products.png` | `6619ce3d…` | `3422132b…` | **changed** |
| `desktop__04-statement-overload.png` | `8aa3f082…` | `e9cc99ec…` | **changed** |
| `desktop__05-statement-breather.png` | `94c3d091…` | `36b0779e…` | **changed** |
| `desktop__06-07-journal.png` | `ad5f6ad2…` | `98c1b762…` | **changed** |
| `desktop__08-about.png` | `687298e7…` | `92754633…` | **changed** |
| `desktop__09-how-i-work-and-socials.png` | `5289a0cc…` | `20a438df…` | **changed** |
| `desktop__10-contact-and-footer.png` | `9e72f52a…` | `96185648…` | **changed** |
| `desktop__contact-menu.png` | `0bf022f6…` | `e0d25e3c…` | **changed** |
| `desktop__products-detail.png` | `514e4cba…` | `d23fbb07…` | **changed** |
| `desktop__reduced-motion.png` | `2caeb964…` | `cda62bc9…` | **changed** |
| `mobile__01-hero.png` | `60c6664f…` | `e525f768…` | **changed** — eyebrow cut |
| `mobile__02-03-products.png` | `633edcec…` | `633edcec…` | same |
| `mobile__04-statement-overload.png` | `6490b876…` | `6490b876…` | same |
| `mobile__05-statement-breather.png` | `a5e8613b…` | `a5e8613b…` | same |
| `mobile__06-07-journal.png` | `7cf964ec…` | `bb455d13…` | **changed** — subtitle cut |
| `mobile__08-about.png` | `fee53205…` | `ee76b53d…` | **changed** — B1 + B2 |
| `mobile__09-how-i-work-and-socials.png` | `7d57cd7b…` | `af95ac70…` | **changed** — see below |
| `mobile__10-contact-and-footer.png` | `ddfef37d…` | `9a547773…` | **changed** — B3 |
| `mobile__nav-open.png` | `38424701…` | `aa1cf376…` | **changed** — eyebrow cut |
| `laptop__01-hero.png` | — | `c79f5379…` | new (1366×768) |

**Desktop: 11 of 11 changed.** Every desktop section picked up the scale work.

**Mobile: 3 of 9 unchanged, 6 changed.** That is not the answer NEXT-004's
test wanted, and it is not a gate leak. The test assumed the only change on
disk was the gated Part A; the same commit also carries Part B and the two
Part C cuts, none of which are gated and all of which are supposed to render
on a phone. So the mobile row needed a different proof:

**The gate test, done properly.** I removed the entire
`@media (min-width: 1280px)` block from `globals.css`, rebuilt, captured all
20 goldens to a scratch folder, then restored the file (byte-identical,
`git diff` empty) and rebuilt. With the block and without it:

| | gated vs ungated build |
| --- | --- |
| 11 desktop goldens | 11 differ |
| 9 mobile goldens | **9 identical** |

Nothing inside the block reaches 390px. Constraint held.

**Where the six mobile changes are**, by pixel diff against the M2 frame
(threshold 8/255, at 2× device pixels):

| Golden | Changed pixels | Region | Cause |
| --- | --- | --- | --- |
| `mobile__01-hero` | 14.0% | y ≥ 298 | eyebrow gone, everything below moves up 20px (hero 602 → 582px) |
| `mobile__nav-open` | 5.6% | y ≥ 725 | the same hero behind the open nav panel |
| `mobile__06-07-journal` | 34.3% | y ≥ 382 | subtitle gone, cards move up (journal 1639 → 1553px) |
| `mobile__08-about` | 25.4% | y ≥ 270 | heading 700 → 300 (now one line, was two; about 858 → 805px) and the solid card |
| `mobile__10-contact-and-footer` | 71.8% | whole frame | backdrop is blue instead of violet (B3) |
| `mobile__09-how-i-work-and-socials` | **0.3%** | three row bands | see next |

`mobile__09` is the odd one: 4,294 device pixels in three bands — the "03"
numeral, the "Built to be left alone" title, and a few rows of the social
icons. Side by side the two frames are indistinguishable; it is text
anti-aliasing, not layout. All three elements are `.reveal`s, whose
transition includes `filter: blur()`, and the reveal thresholds changed this
milestone — my read is that the compositor rasterised that text on a slightly
different path. It is deterministic (three runs identical), so it does not
threaten the goldens as regression images. Not the gate: the ungated build
reproduces it exactly.

`hashes.json` is overwritten with the 21 new values and committed as the M3
baseline.

## The acceptance check — hero at 1920

Measured on the frames, not the CSS: the left stem of the "N" in "Neat" is
exactly cap height, so I counted its white rows in the comp and in both
builds.

| | Comp 1 | M2 build | M3 build |
| --- | --- | --- | --- |
| Lines | 3 | 2 | **3** |
| Cap height (px) | 99 | 72 (−27%) | **95 (−4%)** |
| Line pitch (px) | 137.5 | — | 128 |
| Font size | — | 102.4px | 136px (the 8.5rem cap; 8.6vw would be 165px) |
| Headline box | — | 935×197 | 975×392 |
| First line top | y 292 | y 379 | y 276 |

Pass, on both counts. One thing to look at on sheet 01: the comp breaks
"Neat apps / **with a human** / touch"; the build breaks "Neat apps / with a
/ human touch". Not a width problem — "with a human" needs 920px and the
11ch box is 975px — it is `text-wrap: balance` on `.display` choosing the
more even split (681 / 403 / 906 over 681 / 920 / 388). If you want the
comp's break, `text-wrap: wrap` on `.hero__title` gives it at no other cost;
I have not touched it.

The same balancing puts "Made by / a human" on sheet 08 where the comp has
"Made by a / human".

## Sheets

Six, in `sheets/`, same format as M2 (comp left, build right, 50%).

| Sheet | What it shows now |
| --- | --- |
| 01 | Three lines, cap within 4%, left edge at 441px vs the comp's 99px (the comp is full-bleed; the build is a centred 1400px column with a 1080px hero inner). |
| 02 | Cards 432px wide, icons 230px (were 370 / 160). Heading 96px. The 3-up grid still reads at roughly half the comp's per-card scale, which is the D3 trade. |
| 07 | **Tag pills land two per row on every card** — the NEXT-003 signal that the card is wide enough. Art 230px, breaking 55px above the card top. |
| 08 | Heading is light (B1). Card is solid navy with the border showing (B2). Card copy holds a 46ch measure. |
| 09 | Cards 432px. The violet is at its peak here, as before. |
| 10 | **Blue** (B3). `--tint` is 0 by the time the contact card is up. Mint button and robot mark on blue, as drawn. |

## The two things to watch

**Journal art vs the heading.** Measured at 1920: `.post__art` renders at
**230px**, not 300 — `clamp(118px, 12vw, 300px)` only reaches 300 at a
2500px viewport. `margin-top: -5.5rem` (−88px) less the card's 2rem padding
puts the art top 55px above the card top and **25px below the bottom of the
heading's box**; at 1280 it is 21px. The previous section's bottom is 373px
above the art. So: no collision, nothing pushed. But on the golden the
descender of the "g" in "blog" and the calendar's top ring are about 15px
apart on the third card. It reads as intentional overlap-of-layers rather
than a clash to me; it is close enough that you should look at sheet 07 and
say. Left as is.

**1366×768.** `laptop__01-hero.png` is the new golden; numbers at four widths:

| Viewport | `--shell` | Shell left edge | Side room (edge + `--gutter`) |
| --- | --- | --- | --- |
| 1279 (just under the gate) | 1180 | 49px | ~70px |
| 1280 | 1400 (fills) | 0 | **20px** |
| 1366 | 1400 (fills) | 0 | **20px** |
| 1440 | 1400 | 20px | 40px |
| 1920 | 1400 | 260px | 280px |

The hero itself breathes at 1366: the headline is 117px, three lines, with a
comfortable left indent because `.hero__inner` is capped at 1080px and sits
inside the shell. What does not breathe is the **nav**, which is the only
thing that actually uses the shell's edge at that width — the logo is 34px
from the left of the screen and the "Work with me" button 34px from the
right. And the table shows the real problem: **crossing 1280 upward, the side
room drops from ~70px to 20px.** A 1279 laptop gets more margin than a 1366
one. The fix is one token — `--gutter` inside the ≥1280 block (e.g. 48px), or
`--shell: min(1400px, 100vw - 96px)` — but it changes where every section's
edge sits between 1280 and 1500, so it is a decision, not a tidy-up. Left as
is.

## What Part A shook loose

Things I did not anticipate and NEXT-003 did not list. None are bugs; all
are the levers it named doing exactly what they do.

1. **Only headings, shell and art scaled. Card bodies, buttons and icons did
   not.** Sheet 09: card body 17px vs the comp's ~24px, social icons 64px vs
   ~90px. Sheet 10: the contact card is now 1360px wide but the copy, the
   mint button (210×50 vs the comp's ~480×90) and the robot mark (60px vs
   ~170px) are the M2 sizes inside a bigger box, so the card reads emptier
   than before, not fuller. Sheet 02: the same for "Learn more" and the
   status pills. If the comps are the target, `--fs-lead`/`--fs-body`, the
   button scale and the social icon size want a line each in the same
   ≥1280 block. That is a second round of "change the system", so I have not
   started it.
2. **Section heights moved, so what shares a 1080 frame moved.** About is
   906px (was 976), so "How I work" now peeks in at the bottom of
   `desktop__08-about`. Journal is 1115 (was 1220); products 1104 (was 1009).
   Page: 10,629 → 10,599px at 1920.
3. **The gutter step at 1280**, above.
4. **`text-wrap: balance`** now picks different breaks than the comps on the
   hero and about headings, above.

## Deviations

1. `scripts/goldens.mjs` gained a `laptop` viewport and one extra capture
   (`laptop__01-hero.png`), so the 1366 check is a regression asset rather
   than a one-off. The comp loop still runs desktop and mobile only.
2. `scripts/sheets.py` — one-line fix: relative paths on the command line
   crashed `relative_to(ROOT)`; they are now resolved first. Found by writing
   to `M3/sheets/`.
3. The gate-leak build in the scratch folder: a temporary edit to
   `globals.css`, restored byte-for-byte before the final build (verified
   with `git diff`). Nothing of it is in the repo.

## Questions for the lead

1. Sheet 07 — the 15px between "blog" and the calendar ring: fine, or do you
   want the heading's margin-bottom to grow with the art?
2. The 1280 gutter step — one token, but it moves every edge between 1280 and
   1500. Your call on the number.
3. Shook-loose item 1 — do the card bodies, buttons and icons get the same
   ≥1280 treatment, or is the heading/shell/art scale the whole of D12?
4. `text-wrap: wrap` on the hero title to get the comp's break? One line,
   zero risk, purely a taste call.

## Not done

- `BACKLOG.md` B6 (share/OG image) — non-blocking in NEXT-003; not started,
  the verification took the session.
- The `DECISIONS.md` notes (D5 revised, D12, D13) are yours; I have not
  edited that file.
