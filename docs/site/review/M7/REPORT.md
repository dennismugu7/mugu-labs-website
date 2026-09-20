# M7 — Three notes from the owner

Instructions: `docs/site/lead/NEXT-012-three-owner-notes.md`. The comp-vs-asset
comparisons are in `art/` beside this file, one per asset: **comp region |
new asset on the comp's own backdrop colour | new asset on a checkerboard**.

## Outcome

**1. The scroll hint is gone — markup, CSS and the `rail` keyframes. 2. All
five 3D assets re-cut from the comps by a script that grows the backdrop
from the border and never deletes a pixel for resembling it; the calendar's
lower body is whole, the tape's pill and the bell's edge survive, every
asset checked against its comp region side by side. 3. YouTube is drawn as
its actual mark — the red rounded rectangle, wider than tall, triangle
knocked out — centred in its slot and shorter than its neighbours. Twenty
goldens moved, every one attributed. Pushed, CI green, verified on
`https://mugu-labs.com/` down to the bytes of each asset.**

## Commits this milestone

| sha | subject |
| --- | --- |
| `964de4e` | Commit NEXT-012 and the lead's DECISIONS edits |
| `7439bba` | M7: cut the scroll hint, re-extract the artwork, draw YouTube as its mark |
| _(next)_ | M7: report |

## 1. The scroll hint

`components/Hero.tsx`: the `.hero__scroll` block removed. `styles/globals.css`:
`.hero__scroll`, `.hero__scroll-rail`, its `::after`, the `rail` keyframes and
the `display: none` override in the ≤960px block — 45 lines, nothing else
referenced any of them (`grep` for `hero__scroll` and `rail` is empty). The
hero is 1080px tall at 1920 either way, so nothing below it moved; the four
desktop/laptop hero frames and the four products frames (whose top 96px show
the hero's foot) are the frames that changed for this. Mobile frames did not
— the hint was already hidden under 960px.

## 2. The artwork

### What was wrong

`public/assets/art-calendar.png` against comp 7, before: the bottom-left
corner of the blue body missing, a notch under the middle square, a ragged
lower edge where the comp has a rounded one, and gaps where the body passes
behind the bell — exactly as the owner described and the lead diagnosed. The
other four had survived the old pass better, but were cut the same way.

### `scripts/extract-art.py`

Pillow only, ~2s for all five. Per asset: a crop box on the comp whose border
is all backdrop (gradient or card glass); then

1. **Region growing from every border pixel.** A pixel joins the backdrop
   only if it is within 7 levels per channel of a backdrop *neighbour*. That
   walks across the smooth gradient and the glass fill and stops at any real
   edge, because a subject edge is a step too large to take. Nothing is
   removed for being close to a fitted background — there is no fitted
   background.
2. **Interior seeds, refused unless they are backdrop.** Backdrop the
   subject encloses (the inside of the sync arrows, with a card corner in
   it) cannot be reached from the border, so the asset lists a few comp-space
   points known to be backdrop and they are flooded by the same rule. A seed
   is accepted only if its colour is within 40 levels of the mean of what the
   border flood reached — and that guard earned its place immediately: my
   first seed list put one point on the orange arc, and without the guard the
   whole orange arrow flooded away. The script prints a refusal instead.
3. **Closing, radius 3px,** on the backdrop mask so the cards' 1px border
   lines are swallowed where they run outside the subject. Nothing thicker
   than 6px can be affected; the thinnest real feature (the calendar's rings)
   is ~15px.
4. **Components.** The subject is the largest connected non-backdrop
   component plus any component above a size floor that lies inside its box
   — the "$" inside the sync ring is kept that way; card text under the art
   is dropped.
5. **Alpha** is the mask with a 0.7px Gaussian feather; edge pixels keep the
   blend the comp had. The 2px pad, the crop, and the comparison sheets come
   out of the same run: `python scripts/extract-art.py --check M7/art`.

### Results

| Asset | Before | After | Comp region | Kept |
| --- | --- | --- | --- | --- |
| `art-budget.png` | 435×355, 200KB | 441×361, 185KB | 07 `150,82–591,443` | 1 component |
| `art-sync.png` | 488×406, 189KB | 492×412, 169KB | 07 `741,76–1233,488` | 2 (ring + "$"), 4 seeds, 1 refused |
| `art-calendar.png` | 459×422, 174KB | 464×428, 152KB | 07 `1345,60–1809,488` | 1 |
| `art-tape.png` | 776×406, 374KB | 781×412, 347KB | 08 `1077,272–1858,684` | 1 |
| `art-envelope.png` | 146×132, 27KB | 152×138, 22KB | 10 `452,321–604,459` | 1 |

Slightly larger each time — the old pass had trimmed real edge — and smaller
files, because there is no ragged alpha to encode.

**Side by side, `art/*.png`, what to look for:**

- `art-calendar.png` — the body now ends in the rounded bottom edge with the
  full width of blue under the second row of squares; the corner under the
  bell is there; the rings' holes are open (they connect to the outside at
  the top, so the flood reached them). The bell's soft shadow on the card is
  treated as backdrop — the site adds its own `drop-shadow` to the art, as it
  did before.
- `art-tape.png` — the translucent pill under the tape is intact, left cap
  included, with its glass fill baked from the comp (it was translucent over
  the comp's blue; it is a fixed blue now, on a page that is blue there). The
  cursor and the hand are complete.
- `art-sync.png` — the crook between the red arc, the orange arrowhead and
  the card's corner was the hardest pocket; two seeds cleared it. The small
  orange tail left of the red arrowhead is in the comp.
- `art-budget.png` — the magnifier's lens is a translucent object and carries
  the comp's backdrop inside it, as before and as the old asset did.
- `art-envelope.png` — comp 10 has the stock photographic texture behind the
  card (D14), but the envelope sits on the card's glass, which is smooth
  enough for the flood; clean.

Nothing needed the originals, so B3 stays where it is. If the owner ever has
them, the only visible gain would be the lens and the pill without baked
backdrop.

### Goldens

Journal, about, contact and socials frames moved for the assets:
`desktop__06-07-journal`, `desktop__07-journal-cards`, `desktop__08-about`,
`desktop__10-contact-and-footer`, `desktop__contact-menu`,
`desktop__reduced-motion`, `mobile__06-07-journal`, `mobile__08-about`,
`mobile__10-contact-and-footer`, and `mobile__09-how-i-work`, whose top 96px
(the anchor offset) show the bottom of the about section, i.e. the tape.

One harness nudge: the `07-journal-cards` frame is anchored 170px above the
grid now, not 120 — the art breaks 88px above the grid and the nav covers
the top 73px, so at 120 the calendar's rings were under the nav bar. The
heading now sits behind the nav instead, which is the right thing to hide.

## 3. YouTube

`components/icons.tsx`: Simple Icons' full `youtube` path (CC0, 16.31), no
transform. `styles/globals.css`: `.social--youtube` drops the tile —
`background: none`, no box-shadow (also on hover and as a placeholder) — and
colours the SVG with the tile's red; the SVG fills the slot's width with a
drop-shadow of its own weight. Result at 1920: a 92×65 red mark, vertically
centred in the 92px slot, triangle showing the backdrop through it, between
five 92px squares. `desktop__09-socials`, `mobile__09-socials` and the
contact/footer frames (which show the row) moved for it.

For the record, since the lead measured it too: in comp 9 the YouTube mark
is the *same height* as the square tiles and about 1.6× as wide (130×80 next
to 80×80). The brief asked for the same slot width, shorter — that is what
shipped. If the comp's proportion is wanted instead, it is
`.social--youtube { width: calc(1.42 * <tile>) }` with the SVG at the tile
height, and the row's centring absorbs the extra width.

## The hash table, by cause

| Cause | Frames |
| --- | --- |
| Scroll hint gone | `desktop__01-hero`, `laptop__01-hero`, `laptop1280__01-hero`, `laptop1440__01-hero`; and the four `*__02-03-products` frames, whose top 96px show the hero's foot |
| New artwork | `desktop__06-07-journal`, `desktop__07-journal-cards` (also re-anchored), `desktop__08-about`, `mobile__06-07-journal`, `mobile__08-about`, `mobile__09-how-i-work` (tape at its top) |
| YouTube mark | `desktop__09-socials`, `mobile__09-socials` |
| Artwork + YouTube (both in frame) | `desktop__10-contact-and-footer`, `desktop__contact-menu`, `desktop__reduced-motion`, `mobile__10-contact-and-footer` |
| Unchanged | `desktop__04`, `desktop__05`, `desktop__09-how-i-work`, `desktop__products-detail`, `mobile__01-hero`, `mobile__02-03-products`, `mobile__04`, `mobile__05`, `mobile__nav-open` |

Twenty moved, nine did not, none unexplained. `mobile__01-hero` and
`mobile__02-03-products` unchanged is the check that the hint was indeed
hidden on phones and that nothing else in the hero moved.

## Deviations

1. The `07-journal-cards` anchor, 120 → 170, above.
2. `art/` comparison sheets are generated by the extraction script rather
   than by hand, so the check the lead asked for runs every time the assets
   are re-cut.

## Deployed

- **Pushed:** `964de4e..7439bba` plus this report; `main` = `origin/main`.
- **CI:** <https://github.com/dennismugu7/mugu-labs-website/actions/runs/35490606653> — success.
- **Fetched, verbatim:** `curl -sS -D - "https://mugu-labs.com/?v=m7"` at
  05:02:06 UTC, 15s after the push — HTTP 200, `Server: Vercel`, `Age: 0`,
  `X-Vercel-Cache: MISS`, `Etag "a476c18e…"`, `X-Vercel-Id: cpt1::bwprb-…`.
  Body: `hero__scroll` **0**; the full YouTube path present, the old
  triangle-only transform absent.
- **The five assets from the live domain** (`/assets/art-*.png?v=m7`): all
  200, and each **byte-identical** to the file in `public/assets/`
  (184,779 / 169,155 / 151,868 / 347,496 / 21,818 bytes).
