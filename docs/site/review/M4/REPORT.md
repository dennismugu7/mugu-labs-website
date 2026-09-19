# M4 — Scale the contents

Instructions: `docs/site/lead/NEXT-005-scale-the-contents.md`. Four sheets in
`sheets/` (02, 07, 09, 10). Hashes in `docs/site/review/goldens/hashes.json`,
numbers in `docs/site/review/goldens/capture-log.json`.

## Outcome

**Parts A–C done, all inside the ≥1280 gate. Inset is 70px at 1279, 1280,
1366, 1440 and 1500 — no step — and 280px at 1920. Hero breaks "Neat apps /
with a human / touch" from 1280 up. The contents scale with the boxes through
one new token. All nine mobile hashes identical to M3. Zero build warnings,
zero console messages, zero failed requests.**

One thing did not survive the system scale and got its own rule: the journal
tag pills. Two things the bigger contents broke about the *capture*, not the
site, are fixed in the script. One thing is yours to look at: the 1280–1366
band cannot hold two pills per row.

## Commits this milestone

| sha | subject |
| --- | --- |
| `e9c8b06` | Commit NEXT-005 and the lead's DECISIONS (D12 met, M4 scope) and PROTOCOL edits |
| `12afc90` | Commit the lead's D14–D16 and BACKLOG B11 — these appeared on disk mid-session; committed on their own so the M4 diff is only M4 |
| _(next)_ | M4: scale the contents — `--u`, fluid shell, hero break, journal art |

## The system

One token, `--u`, "the UI unit": `1rem` at `:root`, and inside the ≥1280 block

```
--u: clamp(1rem, 0.3rem + 0.875vw, 1.35rem);   /* 1rem at 1280, 1.35rem at 1920 */
```

Everything in scope is now sized in `--u` instead of `rem` in its *base* rule
— `calc(1.0625 * var(--u))` where it said `1.0625rem` — so below 1280 the
computed values are bit-identical (the mobile hashes are the proof) and above
it the contents grow continuously with the screen. No per-component numbers
live in the block except the three that are viewport-relative anyway (social
icon size, envelope art, contact title), each written so its value at 1280 is
what the base rule already gave.

Converted to `--u`: `.btn` (min-height, padding, font, gap), `.product` gap,
`.product__name` cap, `.product__tagline`, `.product__status`, `.post__title`
cap and margin, `.author` gap, `.author__avatar`, `.author__role`,
`.author__handle`, `.principle` gap, `.principle__index`, `.principle__title`,
`.contact__body` gap, `.footer__links`, `.footer__legal`. `.author__name` now
says `font-size: var(--fs-body)` explicitly (it inherited exactly that), and
`--fs-body` and `--fs-lead` get larger caps in the block so body copy,
`.principle__body`, the bio and the hero lead follow.

Arrow icons inside buttons are `1.3em` in the block (the nav CTA excluded — it
has its own sizes and was not in scope).

**Before / after at 1920**, computed sizes:

| | M3 | M4 | comp, roughly |
| --- | --- | --- | --- |
| Hero lead | 22.4px | 26.4px | ~30 |
| Hero button | 216×56 | 291×76 | — |
| Product name / tagline | 21.6 / 17 | 28.8 / 23 | ~28 / ~24 |
| Product button | 196×56 | 264×76 | ~410×80 |
| Status pill | 10.9 | 14.7 | — |
| Journal title | 19.2 | 25.9 | ~24 |
| Journal tag | 12.8 | 14.4 | ~14 |
| Journal art | 230px (0.53 of card) | **366px (0.85 of card)** | 0.92 |
| Art → heading clearance | 25px | **45px** | — |
| Bio / principle body | 22.4 | 26.4 | ~24 |
| Principle title / index | 16 / 12.8 | 21.6 / 17.3 | ~22 |
| Author avatar / name / role | 62 / 18 / 15.2 | 84 / 22 / 20.5 | ~90 |
| Social icon / gap | 68 / 24 | 92 / 38 | ~90 / ~60 |
| Contact art / title / button | 120 / 32 / 56 tall | 173 / 40 / 76 tall | ~140 / ~38 / 90 tall |
| Footer links / legal | 15.2 / 20 | 20.5 / 27 | — / ~28 |
| Page height | 10,599 | 11,265 | — |

## Part A — the inset

`--shell: min(1400px, 100vw - 100px)` in the block, as specified. Measured
(shell edge + `--gutter`), from `capture-log.json` and a scratch run at the
in-between widths:

| Viewport | 1279 | 1280 | 1366 | 1440 | 1500 | 1920 |
| --- | --- | --- | --- | --- | --- | --- |
| Inset | 70 | **70** | **70** | **70** | 70 | 280 |
| Shell | 1180 | 1180 | 1266 | 1340 | 1400 | 1400 |

Continuous across the gate. Permanent coverage: `laptop1280__`, `laptop__`
(1366, kept) and `laptop1440__` each capture the hero and the products
section — six frames, in `hashes.json`, and `insetPx` is now in the metrics
so the next run reports it without a scratch script.

One caveat that is not visible in headless Chromium: `100vw` includes a
classic scrollbar where the platform draws one, so on a Windows Chrome with a
15px bar the inset in that band is ~62px, not 70. Still no step; just noting
the number will not read exactly 70 on every machine.

## Part B — the hero break

`.hero__title { text-wrap: wrap }` in the block only.

| | 1279 | 1280 | 1366 | 1440 | 1920 |
| --- | --- | --- | --- | --- | --- |
| M3 | Neat apps with / a human touch | Neat apps / with a / human touch | same | same | same |
| M4 | *(unchanged)* | **Neat apps / with a human / touch** | same | same | same |

Three lines everywhere from 1280; the comp's lines. `mobile__01-hero` hash
identical, so `balance` is untouched below the gate.

## Part C — what fell out

**The tag pills.** At the full `--u` scale (17.3px at 1920) the pills wrap to
three rows on every card at 1920 — a 432px card cannot hold "Dashboard X" and
"Smart Moves & Quick Hacks" side by side at that size. Comp 7 draws them
small — about 14px on the slide, plainly *not* scaled with the body — so the
pill is the one in-scope thing that does not follow `--u`. It has its own rule
in the block, `clamp(0.8rem, 0.3rem + 0.625vw, 0.9rem)`: 12.8px at 1280
(base), 14.4px at 1920. That is a deliberate exception with a reason, not a
tenth rule; it is commented as such.

Rows per card with that rule:

| | 1280 | 1366 | 1440 | 1920 |
| --- | --- | --- | --- | --- |
| Card width | 360 | 387 | 412 | 432 |
| Pill rows (3 cards) | 3 / 3 / 3 | 3 / 3 / 2 | **2 / 2 / 2** | **2 / 2 / 2** |

Two-per-row holds from 1440. At 1280–1366 the card is 360–387px and the two
long pills need ~355px of the ~300px content width; that is the NEXT-003
signal ("the card is still too narrow") at the bottom of the band. The only
levers are smaller pills there (below the base 12.8px — I would not) or a
narrower grid gap. Left as is; your call.

**The journal art.** Sized off the card now, not the viewport: `width: 100%;
aspect-ratio: 1` inside the block, so it is 0.82–0.85 of the card's width at
every size in the band (comp: ~0.92). `margin-top: -7.5rem` breaks it 87px
above the card top; `.journal__head { margin-bottom: 8.25rem }` leaves **44–45px**
to the heading at every width (was 25). Nothing collides, nothing is pushed.

**Section heights** at 1920, M3 → M4: products 1104 → 1212, journal 1115 →
1400, about 906 → 1041, work 714 → 759, connect 406 → 430, contact 450 → 498.
Page 10,599 → 11,265. Two consequences for the *frames*:

1. The journal cards no longer fit under the heading in 1080px. Comp 7 is the
   cards, so the script now captures `desktop__07-journal-cards.png` anchored
   120px above the grid (art fully in frame, heading out), and sheet 07 uses
   it. `desktop__06-07-journal` still exists and still answers comp 6.
2. `desktop__09` is bottom-aligned on the socials (M2 decision), and #work +
   #connect are now 1189px, so "How I work" is clipped under the nav in that
   frame. The section is fine; the frame shows less of it. If you want the
   heading in the shot, it needs to become two frames like 06/07.

## The hash table

Against the M3 baseline (`1a00134`).

| Golden | M3 | M4 | |
| --- | --- | --- | --- |
| `desktop__01-hero.png` | `05921110…` | `018c5d11…` | **changed** — break, lead, button |
| `desktop__02-03-products.png` | `3422132b…` | `c69842bf…` | **changed** |
| `desktop__04-statement-overload.png` | `e9cc99ec…` | `e9cc99ec…` | same — statements not in scope |
| `desktop__05-statement-breather.png` | `36b0779e…` | `36b0779e…` | same |
| `desktop__06-07-journal.png` | `98c1b762…` | `fc0fa880…` | **changed** |
| `desktop__07-journal-cards.png` | — | `fa3f0672…` | new |
| `desktop__08-about.png` | `92754633…` | `bee3c86c…` | **changed** — bio, author chip |
| `desktop__09-how-i-work-and-socials.png` | `20a438df…` | `84defce4…` | **changed** |
| `desktop__10-contact-and-footer.png` | `96185648…` | `a3d35713…` | **changed** |
| `desktop__contact-menu.png` | `e0d25e3c…` | `50bb3ec6…` | **changed** — button under the menu |
| `desktop__products-detail.png` | `d23fbb07…` | `fb5e2b13…` | **changed** — buttons, body |
| `desktop__reduced-motion.png` | `cda62bc9…` | `fe4681dd…` | **changed** — full page |
| `laptop__01-hero.png` | `c79f5379…` | `4a67438d…` | **changed** — inset 20 → 70 |
| `laptop__02-03-products.png` | — | `d109afdd…` | new |
| `laptop1280__01-hero.png` | — | `841699e9…` | new |
| `laptop1280__02-03-products.png` | — | `9c6bfaf5…` | new |
| `laptop1440__01-hero.png` | — | `fbecb889…` | new |
| `laptop1440__02-03-products.png` | — | `f5334726…` | new |
| `mobile__01-hero.png` | `e525f768…` | `e525f768…` | same |
| `mobile__02-03-products.png` | `633edcec…` | `633edcec…` | same |
| `mobile__04-statement-overload.png` | `6490b876…` | `6490b876…` | same |
| `mobile__05-statement-breather.png` | `a5e8613b…` | `a5e8613b…` | same |
| `mobile__06-07-journal.png` | `bb455d13…` | `bb455d13…` | same |
| `mobile__08-about.png` | `ee76b53d…` | `ee76b53d…` | same |
| `mobile__09-how-i-work-and-socials.png` | `af95ac70…` | `af95ac70…` | same |
| `mobile__10-contact-and-footer.png` | `9a547773…` | `9a547773…` | same |
| `mobile__nav-open.png` | `aa1cf376…` | `aa1cf376…` | same |

**Mobile: 9 of 9 unchanged.** Nothing leaked. This is the stronger claim than
M3's, because this time the *whole* diff is behind the gate: every base rule
that changed was rewritten to compute the same value at `--u: 1rem`, and the
phone frames say it did.

Two runs of the final build: identical. 27 goldens.

## Sheets

| Sheet | What it shows now |
| --- | --- |
| 02 | Name 29px, tagline 23px, buttons 76px tall — the card contents at the comp's proportion. The cards now run to the bottom of the 1080 frame. |
| 07 | New frame. Art at 0.85 of the card, breaking 87px above it; two pills per row on every card; titles 26px. This is the comp. |
| 09 | Body 26px, titles 22px, icons 92px with 38px gaps. The cards read like the comp's. Heading clipped by the frame, per above. |
| 10 | Envelope 173px, title 40px, mint button 272×76, footer links 20px, copyright 27px. The card is full instead of empty. |

## Deviations

1. **The pill rule** in the block — the one in-scope element that does not
   follow `--u`, with the reason above.
2. **`scripts/goldens.mjs`**: two more laptop viewports (1280×800, 1440×900),
   products captured at all three; a `07-journal-cards` desktop frame; `insetPx`
   in the metrics. The mobile comp loop skips the new journal frame so the
   phone set stays at nine.
3. **`scripts/sheets.py`**: comp 7 maps to the new frame.
4. **`.btn:not(.nav__cta) .btn__arrow`** — the nav CTA was excluded from the
   arrow scaling because it was not in scope and has its own sizes; without
   the exclusion its arrow would have shrunk 2px at ≥1280.
5. Two lead files landed on disk mid-session (D14–D16, B11). Committed as
   their own commit before any M4 change, untouched.

## Questions for the lead

1. Pills at 1280–1366: leave three rows there (my recommendation), or narrow
   the grid gap in the band?
2. Frame 09: split into two frames like 06/07, or accept the clipped heading?
3. `--fs-body` is 22px at 1920 now. It is inherited by everything without an
   explicit size — the product pages' copy included, which is why
   `desktop__products-detail` moved. In scope by the letter ("card body
   text") and it looks right; saying it so it is not a surprise.

## Not done

- B6 (share/OG image) — still not started.
- B11 (`site.url`) — owner-gated; not touched.
