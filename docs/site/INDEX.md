# Design comps → what they map to

Ten comps, exported at 1920×1080 from the source design. Every one is mapped.
These are the visual source of truth for the site (see `PROTOCOL.md` →
precedence).

| Comp | Screen folder | Maps to | Notes |
| --- | --- | --- | --- |
| 1 | `screens/01-hero/ui-1.png` | `components/Hero.tsx` | Logo + wordmark, "Neat apps with a human touch", sub, "Work with me" pill. Nav bar is **not** in the comp — added by the lead (see DECISIONS.md D2). |
| 2 | `screens/02-products-a/ui-1.png` | `components/Products.tsx` | Dashboard X (lime button) and Bookflow (navy button) cards. |
| 3 | `screens/03-products-b/ui-1.png` | `components/Products.tsx` | ODA card (lime button), shown alone in the comp. Built as a 3-up grid with comp 2 — see D3. |
| 4 | `screens/04-statement-overload/ui-1.png` | `components/Statement.tsx` | "Digital overload is real…" — full-bleed, light weight, centred. |
| 5 | `screens/05-statement-breather/ui-1.png` | `components/Statement.tsx` | "Take a breather. I build simple apps that do the heavy lifting." |
| 6 | `screens/06-journal-cta/ui-1.png` | `components/Journal.tsx` (heading) | "Learn more at mugu labs blog" + navy pill. Merged into the journal section — see D4. |
| 7 | `screens/07-journal-cards/ui-1.png` | `components/Journal.tsx` (cards) | Three post cards with 3D art breaking above the card top, tag pills, bottom navy pill. |
| 8 | `screens/08-about/ui-1.png` | `components/About.tsx` | "Made by a human", bio card, author chip with GitHub handle, tape-measure art. |
| 9 | `screens/09-how-i-work-and-socials/ui-1.png` | `components/Principles.tsx` + `components/Connect.tsx` | Note the **violet** gradient here, not blue — the backdrop shifts on scroll (D5). Six social icons. |
| 10 | `screens/10-contact-and-footer/ui-1.png` | `components/Contact.tsx` + `components/Footer.tsx` | Envelope art, mint "Contact me" button, robot mark, copyright line. |

## Surfaces that exist in code but are not drawn

Flagged per the scope rule. All are IN, with reasons, unless marked otherwise.

| Surface | File | Status | Reason |
| --- | --- | --- | --- |
| Sticky nav bar + mobile menu | `components/Nav.tsx` | IN | A one-page scroll site with ten screens of content is unnavigable without it. |
| Product detail pages | `app/products/[slug]/page.tsx` | IN | Comps 2 and 3 show a "Learn more" button that must lead somewhere. Content is lead-drafted and needs owner review — see `lead/NEXT-001`. |
| 404 page | `app/not-found.tsx` | IN | Required by any deployed site. |
| Blog index / post pages | — | DEFERRED | `BACKLOG.md` B1. Comps point at an external blog. |

## Assets extracted from the comps

The artwork in `public/assets/` was cut out of these PNGs (icons masked to
rounded squares, illustrations keyed off the gradient and cleaned of the card
borders that were baked into the crops, avatar cropped to a circle). If higher
resolution originals exist, they drop in under the same filenames.

The robot mark was rebuilt as vector — `components/Logo.tsx` and
`public/favicon.svg` — rather than extracted, so it stays sharp at any size.
