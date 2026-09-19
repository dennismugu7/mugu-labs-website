# Decisions

Highest precedence document in this repo. If code or a comp disagrees with
something here, this wins and the builder reports the deviation.

---

## D1 — Stack: Next.js App Router, static export, no other runtime dependencies

`next`, `react`, `react-dom`. Nothing else in `dependencies`.

The motion layer (`lib/motion.ts`, ~2KB), the icons, the logo and the styling
are all in-repo rather than libraries. `next.config.mjs` sets
`output: "export"`, so a build produces a plain folder of static files.

**Reason.** The owner's own copy commits to apps that work "on a five-year-old
Android". A marketing site that ships an animation library to make text fade in
does not honour that. It also keeps the site host-agnostic — nothing about it
is tied to Vercel.

**Constraint this creates.** No `next/image` optimisation, no server
components doing data work, no ISR. None of these are needed. Do not add a
dependency to solve a problem that CSS solves; if you think one is genuinely
required, put it in the report as a question rather than installing it.

## D2 — A navigation bar was added, though no comp shows one

Sticky, transparent over the hero, gains a blurred background once scrolled,
collapses to a menu button under 760px.

**Reason.** Ten screens of vertical content with no way back to the top or
across to a section is a worse site than the comps imply. This is a deliberate
override of "what's in the comps is all there is", recorded here as required.

## D3 — The three product cards are one 3-up grid

Comps 2 and 3 split them across two screens. The build puts all three in one
responsive grid: 3 columns, 1 column under 960px.

**Reason.** The split is an artifact of a 1920×1080 slide canvas, not a design
intent. A web page has no slide boundary.

## D4 — Comp 6 became the journal section's heading, not its own screen

"Learn more at mugu labs blog" is the section heading above the three cards
from comp 7. The standalone navy pill from comp 6 was dropped; the identical
pill at the bottom of comp 7 was kept.

**Reason.** Two identical buttons, one screen apart, reads as a mistake on a
continuous page.

## D5 — One continuous backdrop that shifts hue with scroll depth

Comps 1–8 are blue; comp 9 is violet. Rather than two backgrounds meeting at a
seam, a single fixed gradient layer cross-fades blue → violet as the "How I
work" section enters the viewport, driven by a `--tint` custom property.

## D6 — Fonts are self-hosted, not loaded from Google

Poppins, subsetted to Latin, four weights, ~65KB total, in `public/fonts/`.

**Reason.** One less third-party connection, no render-blocking request to a
host that may be slow from Nairobi, and the site works offline in dev.

`scripts/build-fonts.py` regenerates them; `public/fonts/LICENSE.md` records
the OFL terms the files ship under.

## D7 — "Contact me" opens a choice of email or WhatsApp

A small menu, keyboard accessible, closes on Escape and outside click.
WhatsApp goes to `wa.me/254701408727` with a pre-filled message.

**Reason.** The owner asked for both. The WhatsApp route also matches ODA's
own pitch — "same personal WhatsApp touch".

## D8 — Contact email is currently a personal Gmail

`lib/site.ts` → `site.contact.email`. It is real and it works, but it is a
personal address on a studio site. Replace with a `mugu-labs.com` address once
the domain has mail. Tracked as `BACKLOG.md` B4.

## D9 — Deploy to Vercel, from GitHub, auto on push to `main`

Repo `dennismugu7/mugu-labs-website`, public. Every push to `main` deploys;
branches get preview URLs.

**Reason.** The owner said the site will be updated constantly. Git-push-to-live
with no build step to remember is the shortest loop. Because of D1 the output
is static, so moving to Cloudflare Pages or Netlify later costs a settings
change, not a rewrite.

## D10 — The site has never been built

Written in an environment where `npm install` was blocked by network policy.
Verified instead by server-rendering the real components with
`react-dom/server` and screenshotting them at 1440×900 and 390×844 — which is
how the layout was checked against the comps, and how one real bug was caught
(a spread was overwriting `className` on every styled element).

`next build` itself has never run. Treat the first build as untrusted: see
`lead/NEXT-001`, which lists the four places it is most likely to fail.

## D11 — The `preview/` folder is a dev harness, not part of the site

It renders components to static HTML and screenshots them. `npm run build`
never touches it. It stays because it is the fastest way to eyeball every
section at once, and because it does not need a browser or a dev server.

If it becomes a maintenance cost, delete the folder — nothing imports from it.
