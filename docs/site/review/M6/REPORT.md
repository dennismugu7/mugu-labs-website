# M6 — Canonical tags, and placeholders that render as placeholders

Instructions: `docs/site/lead/NEXT-011-canonical-and-placeholders.md`, which
folds in `NEXT-010-honest-placeholders.md`. Decisions D20 and D21. No sheets
this milestone — nothing visual changed, and that is the claim to prove.

## Outcome

**Every page on the live domain now carries `<link rel="canonical">`
pointing at its own `mugu-labs.com` URL. Every not-yet-known destination is
`""` in `lib/site.ts` and renders as a non-interactive element with the same
pixels: no `href="#"` is left on the site. `noUnusedLocals` and
`noUnusedParameters` are on. All 29 goldens pixel-identical between the
build before and the build after. Pushed, CI green, verified on
`https://mugu-labs.com/`.**

## Commits this milestone

| sha | subject |
| --- | --- |
| `a79a723` | Commit NEXT-011 and the lead's BACKLOG edit |
| `723f40c` | M6: canonical tags, and placeholders that render as placeholders (D20, D21) |
| `2e509cd` | M6: the 404 page carries no canonical and is noindex |
| `01598be` | M6: let Next supply the 404 noindex tag (it already does) |
| _(next)_ | M6: report |

## Part A — canonical

`app/layout.tsx`: `alternates: { canonical: "/" }`, relative, resolved
against the existing `metadataBase` (`site.url`) — the host is written once.
`app/products/[slug]/page.tsx`'s `generateMetadata` sets
`alternates: { canonical: "/products/<slug>/" }` (trailing slash, as the
export and the sitemap have it) and, while there, `openGraph.url` for the
product page, which had been inheriting the home page's. Next replaces the
`alternates` object per page rather than merging it, so each product page
gets its own and nothing else changes.

Found on the way: the 404 page inherited the layout's canonical and so
claimed to be `https://mugu-labs.com/`. `app/not-found.tsx` now sets
`alternates: { canonical: null }` and a title. Next already adds
`<meta name="robots" content="noindex">` to not-found pages; my first pass
set it too and produced the tag twice, so the third commit removes mine.

**Verified on the live domain, each page fetched with `?v=m6`:**

| Page | Status | `rel="canonical"` |
| --- | --- | --- |
| `https://mugu-labs.com/` | 200 | `https://mugu-labs.com/` |
| `https://mugu-labs.com/products/dashboard-x/` | 200 | `https://mugu-labs.com/products/dashboard-x/` |
| `https://mugu-labs.com/products/bookflow/` | 200 | `https://mugu-labs.com/products/bookflow/` |
| `https://mugu-labs.com/products/oda/` | 200 | `https://mugu-labs.com/products/oda/` |
| `https://mugu-labs.com/does-not-exist/` | 404 | none; `robots: noindex` |

The Vercel alias and `www` serve the same documents, so a crawler arriving by
either is told the apex is the address.

## Part B — placeholders (D20)

`lib/site.ts`: the six `socials[].href`, the three `posts[].href` and
`site.blogUrl` are `""`. The comments beside them say what `""` means and
that pasting a URL is the whole change.

Components branch on the value:

| Placeholder | Was | Now |
| --- | --- | --- |
| Social tile ×6 | `<a href="#" aria-label="Facebook (coming soon)" aria-disabled>` | `<span class="social social--facebook social--placeholder" role="img" aria-label="Facebook — not linked yet">` |
| Journal card ×3 | `<a class="card card--hover post" href="#">` | `<article class="card post">` |
| Blog pill | `<a class="btn btn--navy" href="#journal">` (scrolled to itself) | `<span class="btn btn--navy btn--placeholder">more at mugu labs blog<span class="sr-only"> — coming soon</span>…</span>` |

A real URL renders the `<a>` exactly as before (`post--link` carries the
card's hover rules now, so a card that is a link still lifts and a card that
is not does not). CSS: `.social--placeholder` and `.btn--placeholder` get
`cursor: default` and hover rules that hold the rest state — no lift, no
shadow, no arrow nudge, no sheen.

**How a placeholder announces itself to assistive technology:** a social
tile is an image named "Facebook — not linked yet" — a screen reader says
the network is there and that it is not a link; the blog pill reads "more at
mugu labs blog — coming soon" as text; a journal card is an article of a
heading and three tags, which is what it is. None of them is in the tab
order, none has a link role.

**Checked in a browser, not by reading the markup** (`out/`, 1920×1080):

- `a[href="#"]` on the page: **0** (was 10: six tiles, three cards, the pill).
- All six tiles: `SPAN`, `role="img"`, `tabIndex -1`, `cursor: default`.
  Cards: `ARTICLE`, `tabIndex -1`, `cursor: auto`. Pill: `SPAN`, `tabIndex -1`,
  `cursor: default`, text "more at mugu labs blog — coming soon".
- Clicking the Facebook tile and then the pill: `location.hash` stays empty
  and the page stays where it was (no jump to the top, which `href="#"` did).
- Tab from the "Let's stay connected" heading: **Contact me → Dashboard X →
  Bookflow → ODA** — straight past the six tiles into the contact button and
  the footer links.
- Focusable elements on the page: 24, i.e. the ten placeholders are gone from
  the sequence and nothing else moved.

## D21 — the flags

`tsconfig.json`: `"noUnusedLocals": true`, `"noUnusedParameters": true`.
`tsc --noEmit` clean; CI (which runs typecheck before build) green on every
commit. B8 in `BACKLOG.md` already reads "Decided, D21".

## Goldens — nothing moved

The honest test, since the hash file flakes on the nav blur (M5): I built
the tree **before** these changes (stash), captured all 29 frames to a
scratch folder, restored, built **after**, captured again, and pixel-diffed
every pair. **29 of 29 identical — zero differing pixels in any frame.**

`hashes.json` in the commit shows `desktop__06-07-journal` moved against the
M5 file; that is the known 22×2px nav-blur flake alternating again (the
frame is pixel-identical to the pre-change build's). Recorded, not chased,
per NEXT-010.

## Deviations

1. The 404 page's canonical and title — not in the brief; found while
   fetching the pages and fixed because a 404 claiming to be the home page
   is the same class of lie as `href="#"`.
2. `openGraph.url` on product pages, one line, same reason.
3. `post--link` class: the card hover rules moved from `.post:hover` to
   `.post--link:hover` so a placeholder card cannot inherit an affordance.

## Deployed

- **Pushed:** `f001b57..01598be` plus this report; `main` = `origin/main`.
- **CI:** [35463806702](https://github.com/dennismugu7/mugu-labs-website/actions/runs/35463806702)
  (canonical + placeholders) success;
  [35463917272](https://github.com/dennismugu7/mugu-labs-website/actions/runs/35463917272)
  (404) success; the run for `01598be` is noted at the end of this section.
- **Fetched, verbatim:** `curl -sS -D - "https://mugu-labs.com/?v=m6"` at
  19:16:52 UTC, 15s after the push — HTTP 200, `Server: Vercel`,
  `Etag "8991917f…"`, `X-Vercel-Id: cpt1::bjcpt-…`. Body: `href="#"` **0**,
  `social--placeholder` ×6 tiles, `<article class="card post">` ×3,
  `btn--placeholder` ×1, canonical as tabled above.
  `https://mugu-labs.com/does-not-exist/?v=m6b` at 19:18:53 UTC → 404, no
  canonical, `noindex`.
- This machine's resolver has caught up: `mugu-labs.com` now resolves to
  Vercel (`64.29.17.65` / `64:ff9b::401d:1141`) here too, so these fetches
  needed no pinning; the first canonical check was pinned to `216.198.79.1`
  anyway and agreed.
- **Run for `01598be`:** success https://github.com/dennismugu7/mugu-labs-website/actions/runs/35464010613
