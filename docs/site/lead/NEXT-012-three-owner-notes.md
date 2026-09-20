# NEXT-012 — Three notes from the owner, two of them my errors

Append-only. Milestone **M7**. Small, but one of them has been wrong since the
first hour of this build.

M6 accepted — the 29-frame pixel-diff to prove "nothing visual changed", and
catching the 404 inheriting the home page's canonical without being asked to
look there.

## 1. Cut the scroll hint

The `SCROLL` indicator at the bottom of the hero. He asked whether it is really
necessary. It is not, and I should not have added it.

It was mine, not in any comp, and I justified it in NEXT-003 as "a web
affordance a slide does not need". Looking at his screenshot, that reasoning
does not survive contact: at the scroll position where the hint sits, **the
next section is already visible on screen** — "THE SHELF / Three apps, each…"
is right there below it. A hint telling someone to scroll, positioned where
they can already see what scrolling reveals, is decoration.

It also sits alone in a large empty field of gradient, which draws the eye to
the least important thing on the screen.

Remove `.hero__scroll`, its rail, and the `rail` keyframes. Nothing else
references them.

## 2. Re-extract the artwork — the calendar is damaged, and it is my fault

He says the calendar illustration "feels incomplete". He is right, and I
checked it against the comp rather than taking his word or dismissing it.

Comp 7's calendar: the blue body extends well below the second row of date
squares and ends in a clean rounded bottom edge with a soft shadow.

`public/assets/art-calendar.png`: the bottom of the blue body is **chewed
away** — the bottom-left corner eaten, a jagged notch under the middle square,
a ragged lower edge instead of a rounded one, and chunks missing where the body
passes behind the bell.

**Cause is mine.** I cut these assets out of the comps in the first hour by
flood-filling the gradient background, then fitting a quadratic background
model and deleting every pixel within a tolerance of it, then applying a
morphological opening to kill thin artefacts. The calendar's lower body is a
mid-blue close enough to the background gradient that the residual-model pass
ate it, and the opening rounded off what survived.

**Re-extract all five from the comps in this repo**, which are the originals:

| Asset | Source |
| --- | --- |
| `art-budget.png` | `docs/site/screens/07-journal-cards/ui-1.png` |
| `art-sync.png` | same |
| `art-calendar.png` | same |
| `art-tape.png` | `docs/site/screens/08-about/ui-1.png` |
| `art-envelope.png` | `docs/site/screens/10-contact-and-footer/ui-1.png` |

Method is yours to choose. What matters:

- **Do not delete pixels merely because they resemble the background.** A
  flood fill inward from the border is safe; a global "close to the fitted
  background model" pass is what caused this.
- Watch the parts most at risk: the calendar's lower body, the translucent blue
  pill under the tape measure, and any soft drop shadow that belongs to the
  subject.
- Write a script in `scripts/` so this is repeatable rather than a one-off.
- **Verify each one against its comp region side by side** and put those
  comparisons in the report. That check is what I skipped, and it is why this
  shipped.

Sizes will change; the layout sizes art off its container, so that is fine.
Goldens will move for the journal, about and contact frames — expected,
attribute them.

If any asset cannot be recovered cleanly from a 1920×1080 comp, say so; that is
`BACKLOG.md` B3 and the owner may have the originals.

## 3. YouTube — the mark is not a square

He is right again, and my NEXT-006 instruction was half wrong.

I said "the tile carries the brand shape, the glyph carries the mark". For five
of the six that is true. For YouTube it is not: **YouTube's mark is a red
rounded rectangle, wider than tall, with the play triangle knocked out of it.**
Putting a triangle inside a red *square* produces what he described — a generic
video-player app icon.

Comp 9 draws it correctly: I checked, and the YouTube slot there is the red
"tv" silhouette with the triangle cut out, visibly wider and shorter than the
five square tiles beside it.

So: render YouTube as its actual mark. Simple Icons' YouTube path is that full
shape, not just the triangle — use the whole path in red rather than extracting
the triangle from it. Keep it in the same grid slot at the same optical weight
as its neighbours, vertically centred. It will be shorter than the squares.
That is correct and it is what was drawn.

Leave the other five alone.

## Report

`docs/site/review/M7/REPORT.md`. The comp-vs-asset comparisons for item 2 are
the part I most want to see. Usual Deployed section against
`https://mugu-labs.com/`.
