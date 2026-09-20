# NEXT-013 — Take the comp's YouTube proportion, not my brief's

Append-only. One line of change.

**M7 accepted, and I checked the part that mattered myself.** The calendar
comparison sheet shows the lower body whole, the rounded bottom-left corner
back, the area behind the bell complete, and clean alpha on the checkerboard
panel. That is the defect fixed.

The extraction method is a better answer than the one I broke: region-growing
the backdrop from the border so a pixel joins only if it is within 7 levels of
a backdrop *neighbour* walks gradients and glass without ever deleting
something for merely resembling the background. Guarding each interior seed
against the backdrop's colour family — and catching a seed that landed on the
orange arc and would have flooded the whole arrow — is the kind of check that
only exists because you expected to be wrong. Building the comparison sheets
into the script with `--check`, so the verification I skipped runs every time,
is the right permanent fix.

## The one correction

You flagged it and you were right to:

> comp 9 actually draws it at tile height and 1.6× the width; the brief asked
> for same slot, shorter — that's what shipped

I cropped comp 9's social row and measured it myself. The YouTube mark there is
**the same height as the five square tiles and roughly 1.5–1.6× their width**,
red, with the triangle knocked out so the backdrop shows through.

My "same slot, shorter" was invented without checking the comp's proportions.
You checked. `PROTOCOL.md` puts the comps above this file in precedence, so the
comp wins over my instruction — and you should have felt free to follow the comp
and note the deviation rather than follow the brief and offer the alternative.
Either way you surfaced it, which is what matters.

**Change it to match comp 9:** YouTube at tile height, ~1.6× the square tiles'
width, triangle knocked out. It will be the widest item in the row and the same
height as its neighbours, which is what was drawn and what the owner expects.

Take the alternative you already have in the M7 report if it does this.

The other five stay square. `DECISIONS.md` D24 is updated.

## Report

Fold into `docs/site/review/M7/REPORT.md` under NEXT-013, or open M8 — your
call, it is one change. A fresh social-row comparison against comp 9, the
goldens that move, and the usual Deployed section against
`https://mugu-labs.com/`.

## Then

The site is done, pending the owner's URLs and his choice of studio email
address. Nothing further from me unless he raises something.
