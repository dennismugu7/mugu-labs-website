# M2 — screenshot index

Everything here was captured from the built export (`out/`, served with
`serve`), not the dev server. Chromium via Playwright 1.63. CSS animations
frozen; every reveal warmed by scrolling the whole page first; smooth
scrolling forced instant. Two full runs produced byte-identical files for all
20 goldens, so they work as regression images.

Regenerate: `npm run build && node scripts/goldens.mjs && python scripts/sheets.py`
(Playwright is not a devDependency — see the report).

## Sheets — `sheets/` (comp left, build right, both at 50%)

| Sheet | Answers comp | Build shot used | Note |
| --- | --- | --- | --- |
| `01-hero.png` | 1 | `desktop__01-hero` | |
| `02-products-a.png` | 2 | `desktop__02-03-products` | One 3-up grid in the build (D3) — comps 2 and 3 share this shot |
| `03-products-b.png` | 3 | `desktop__02-03-products` | as above |
| `04-statement-overload.png` | 4 | `desktop__04-statement-overload` | Pinned statement at its hold frame |
| `05-statement-breather.png` | 5 | `desktop__05-statement-breather` | as above |
| `06-journal-cta.png` | 6 | `desktop__06-07-journal` | Comp 6 is the journal heading in the build (D4) — comps 6 and 7 share this shot. The bottom pill from comp 7 is below the 1080 frame; it is visible in `desktop__reduced-motion` |
| `07-journal-cards.png` | 7 | `desktop__06-07-journal` | as above |
| `08-about.png` | 8 | `desktop__08-about` | |
| `09-how-i-work-and-socials.png` | 9 | `desktop__09-how-i-work-and-socials` | `#work` + `#connect` are 1121px tall, 41px over a frame; framed so the bottom of the socials is the bottom of the shot, losing only top padding |
| `10-contact-and-footer.png` | 10 | `desktop__10-contact-and-footer` | Scrolled to the end of the page |

Every comp has a sheet. None were skipped.

## Goldens — `shots/`

Desktop 1920×1080 @1x (the comps' own pixel size). Mobile 390×844 @2x.

| File | What |
| --- | --- |
| `desktop__01-hero.png` / `mobile__…` | Top of page |
| `desktop__02-03-products.png` / `mobile__…` | `#products` top at frame top |
| `desktop__04-statement-overload.png` / `mobile__…` | First pinned statement, hold frame |
| `desktop__05-statement-breather.png` / `mobile__…` | Second pinned statement, hold frame |
| `desktop__06-07-journal.png` / `mobile__…` | `#journal` top at frame top |
| `desktop__08-about.png` / `mobile__…` | `#about` top at frame top |
| `desktop__09-how-i-work-and-socials.png` / `mobile__…` | `#work` + `#connect`, bottom-aligned |
| `desktop__10-contact-and-footer.png` / `mobile__…` | Page end |
| `desktop__products-detail.png` | `/products/bookflow/`, full page (1920×1449) |
| `desktop__contact-menu.png` | Page end with the contact menu open (Email / WhatsApp) |
| `desktop__reduced-motion.png` | Full page (1920×7279) with `prefers-reduced-motion: reduce` emulated — pinned statements become plain blocks, nothing hidden behind a reveal |
| `mobile__nav-open.png` | Mobile menu expanded |

Full-page shots: the gradient is `position: fixed`, which a full-page capture
only paints for the first viewport. For those three shots the backdrop was
stretched over the document at capture time; the page itself is unchanged.

## Numbers — `capture-log.json`

Console messages, failed requests and a metrics block per viewport (type
sizes, heading line counts, section heights, social rows, horizontal
overflow, `backdrop-filter` support). Both viewports: **0 console errors or
warnings, 0 failed requests**, across `/`, all three product pages and
`/404.html`.
