# NEXT-003 — Scale, and the three things the comps got right

Milestone: **M3**. Append-only.

M2 accepted, and it was the best work of this build so far. The capture
findings — `scroll-behavior: smooth` silently defeating programmatic scrolls,
and Playwright not painting a fixed backdrop past the first viewport of a
full-page shot — are exactly the kind of thing that turns into a false bug
report a week later. Both are now written down. Two runs producing
byte-identical goldens is what makes them regression tests; that was the point
and you hit it.

I reviewed sheets 01, 07, 08 and 10 myself. Your reading is right on every one.

---

## Part A — the scale decision

**One call, as you framed it: the build is undersized and it gets fixed.**

I want to be precise about why, because "match the comps" would be the wrong
instruction. Looking at sheet 01 and sheet 07 side by side, this is not the
comps being slide-shaped. At 1920 the build puts everything in a 1180px column
and leaves 740px of empty gradient on either side, so the hero reads as a
small design on a big monitor while the comp reads as confident. Sheet 07 is
worse: the cards are cramped, the art is shrunk to a third of its drawn size,
and the tag pills stack one per row purely because the card is too narrow.

Recorded as `DECISIONS.md` **D12**. The levers you identified are the right
ones. Starting points, not gospel:

- `--shell` 1180px → **1400px**
- `--fs-display` top of clamp 6.4rem → **8rem**
- `--fs-section` top 5rem → **6rem**
- `--fs-statement` top 4.4rem → **5.5rem**
- `.product__icon` and `.post__art` sizes up proportionally — the art should
  read at roughly the drawn size relative to its card
- footer mark and copyright line up from 76px / 0.95rem

**Acceptance check, and it is a real check:** at 1920 the hero headline wraps
to three lines as in comp 1, and lands within about 10% of the comp's cap
height. Re-run the goldens and put the new sheet 01 and sheet 07 in the report.

**Constraints while you do it:**

- Prose keeps a readable measure. `.lead` stays capped in `ch`; `.about__card`
  gets a max-width so the bio does not become one long line.
- **Nothing below 1280px changes materially.** Re-capture mobile and confirm
  against the M2 goldens — if a mobile golden's hash moves, that is a
  regression, not a feature. The `clamp()` minimums and the breakpoints stay.
- Tag pills should land two-per-row at the wider card width, as comp 7 draws
  them. If they do not, that is a signal the card is still too narrow.

Do not fix the ten rows individually. Change the system, re-capture, and show
me what fell out.

## Part B — the three genuine fidelity bugs

**B1. "Made by a human" is the wrong weight.** Light (300), as drawn. You were
right and I disagree with nothing: `.about__title` uses `.display`, which is
the hero's 700. Every sibling heading — "How I work", "Let's stay connected",
"Learn more at mugu labs blog" — is light in both comp and build. This one is
mine, from reaching for the wrong class.

**B2. The bio card should be solid, not translucent.** Comp 8 draws a solid
navy fill with a visible border; the build's glass lets the gradient through
and the text loses contrast. Make it solid as drawn. The glass treatment stays
everywhere else.

**B3. The backdrop returns to blue.** Comp 10 is blue; only comp 9 is violet.
`DECISIONS.md` **D5 is revised** — violet is a passage the page moves through,
not where it ends. `--tint` should peak across the principles and socials
sections and be back to 0 by the contact card. The mint button and the robot
mark both read better on blue, which is presumably why it was drawn that way.

## Part C — your other questions

**Playwright → add it to `devDependencies`.** You were right to ask rather than
install. The answer is yes: the goldens are now a regression asset, and an
asset that cannot be regenerated from a clean clone rots. It does not touch
`dependencies`, so D1 holds. Note the browser download in the README so it is
not a surprise.

**The 43MB.** Keep M2's frames in history — one round is a fair price. From M3,
per `DECISIONS.md` **D13**: `sheets/` stays in git, `shots/` is gitignored, and
`scripts/goldens.mjs` writes a committed `hashes.json` with a SHA-256 per
golden. A few KB that still fails loudly when a render changes. Add the check
to the script so a re-run reports which hashes moved.

**The reveal trigger line** — the socials sitting 4px short of the observer's
threshold at one exact scroll position. Real, tiny, and worth one line: widen
`rootMargin` slightly so an element that is fully in frame always triggers.
Do it while you are in there.

**The undrawn additions.** Decided, so this stops being an open question:

| Addition | Verdict |
| --- | --- |
| Nav bar | **Keep** — D2, deliberate |
| Hero eyebrow "A ONE-PERSON STUDIO" | **Cut.** The comp leads with the headline and is stronger for it. It delays the only line that matters. |
| Hero scroll hint | **Keep.** A web affordance a slide does not need. |
| Products heading | **Keep.** The comps rely on slide sequence to say "here are the products"; a continuous page has to say it. |
| Product status pills (LIVE / IN BUILD) | **Keep, pending an owner answer** — see below. Honest if true. |
| Journal subtitle | **Cut.** My filler copy, in my voice, not his. |
| Principle numerals 01/02/03 | **Keep.** Subtle, and they help scanning. |
| Footer link row | **Keep.** A footer with no links on a multi-page site is a dead end. |

## Part D — report

`docs/site/review/M3/REPORT.md`, same shape, plus:

- the new sheets for **01, 02, 07, 08, 09, 10** — the ones where scale was the
  complaint
- a before/after line for the hero headline: cap height and line count at 1920,
  against the comp's
- **mobile hash comparison** against M2: which mobile goldens changed, and if
  any did, why that was unavoidable
- anything Part A broke that I did not anticipate

Non-blocking: if Part A lands cleanly and you want to keep moving, `BACKLOG.md`
B6 (a share/OG image) is self-contained — one 1200×630 image built from the
logo and the hero line, no decisions needed from me.

## What I need the owner for

I am asking him these two now, so you will have answers by the time they
matter:

1. The photographic texture behind the contact card in comp 10 — his asset, or
   a stock placeholder in the slide? Good question to have asked; if it is not
   his, the build should not chase it.
2. Whether Dashboard X and Bookflow are genuinely live, and ODA genuinely still
   in build. The status pills claim it and I invented those values.
