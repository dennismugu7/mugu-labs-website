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

Comps 1–8 are blue, comp 9 is violet, **and comp 10 returns to blue.** A single
fixed gradient layer cross-fades blue → violet → blue, driven by a `--tint`
custom property.

**Revised after M2.** The original implementation ramped to violet at "How I
work" and never came back, which contradicted comp 10. Violet is a passage the
page moves through, not a destination: the site opens and closes in the brand
blue. `--tint` peaks across the principles and socials sections and returns to
0 by the contact card.

## D6 — Fonts are self-hosted, not loaded from Google

Poppins, subsetted to Latin, four weights, **woff2, ~32KB total**, in
`public/fonts/`. (Shipped as .ttf at ~65KB until M2; the woff2 swap was verified
by all twenty goldens staying byte-identical.)

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

## D10 — The site was written without ever being built (resolved in M1)

Written in an environment where `npm install` was blocked by network policy.
Verified instead by server-rendering the real components with
`react-dom/server` and screenshotting them at 1440×900 and 390×844 — which is
how the layout was checked against the comps, and how one real bug was caught
(a spread was overwriting `className` on every styled element).

**Resolved in M1.** It built first try on Next 15.5.25 with no code changes —
none of the four predicted failure points fired. Kept here as the record of why
M1 was shaped the way it was.

## D11 — The `preview/` folder is a dev harness, not part of the site

It renders components to static HTML and screenshots them. `npm run build`
never touches it. It stays because it is the fastest way to eyeball every
section at once, and because it does not need a browser or a dev server.

If it becomes a maintenance cost, delete the folder — nothing imports from it.

## D12 — Desktop scale: the build was undersized, and that is being fixed

M2's contact sheets showed the build rendering at roughly 0.65–0.7× the comps
at 1920 wide, consistently across all ten. This is not a slide artefact to be
waved away — at 1920 the hero occupies a narrow centre column and reads as a
1180px design stretched onto a large monitor, where the comp reads as
confident. The comps are right about presence.

So: the shell widens and the type clamps rise on large screens. The comps are
**matched on impression, not copied on pixels** — a web page keeps a readable
measure for prose (`.lead` stays capped in `ch`) and keeps its responsive
behaviour intact; nothing below 1280px should change materially.

Acceptance: at 1920 the hero headline wraps to three lines as drawn, and lands
within about 10% of the comp's cap height.

**Met in M3.** Three lines; cap height 95px against the comp's 99px, −4%,
measured off the captured frames rather than read from the CSS. Implemented as
an `@media (min-width: 1280px)` block rather than by editing the root tokens,
which makes "nothing below 1280 changes" structural instead of a thing to
re-check — and that was proved by deleting the block, capturing, and restoring:
all nine mobile goldens identical with and without it.

**Scale is two rounds, not one.** M3 scaled headings, shell and art; the
contents of the boxes — card bodies, buttons, social icons, the contact card —
were still M2-sized inside M3-sized boxes. That is M4.

**One regression it introduced**, found at capture: a hard `--shell: 1400px`
made the content inset *drop* from ~70px at 1279 to 20px at 1280, tightening
the site at exactly the width meant to loosen it. Fixed by making the shell
fluid — `min(1400px, 100vw - 100px)` — which lands the inset at 70px on both
sides of the breakpoint and grows from there.

## D13 — Goldens are a regression asset; the raw frames stay out of git from M3

`scripts/goldens.mjs` produces byte-stable captures — animations frozen,
reveals warmed, pinned statements caught mid-hold. Two consecutive runs matched
exactly, which is what makes them regression tests rather than screenshots.

They are also 43MB per round, and there will be several rounds. From M3:

- `sheets/` stays in git — small, and it is the artefact a human reviews
- `shots/` is gitignored, and the script writes a committed `hashes.json`
  (SHA-256 per golden) instead — a few KB that still fails loudly when a render
  changes

M2's frames stay in history. One round at 43MB is a fair price; a hundred
megabytes by M5 is not. If the repo ever feels heavy, stripping them is still
possible while this repo is small.

## D14 — Comp 10's photographic background is not reproduced

The faint hand-and-network-diagram texture behind the contact card in comp 10
is **stock from the slide template**, confirmed by the owner. It is not a Mugu
Labs asset.

So the build does not chase it. The contact section keeps the gradient and the
grain layer. Anything that looked like a missing background there is answered:
nothing is missing.

This is also the general rule when a comp contains template furniture — match
what the studio owns, not what the slide deck shipped with.

## D15 — The product status badges are true

LIVE on Dashboard X and Bookflow, IN BUILD on ODA — **confirmed by the owner**.
They were invented by the lead in the first draft of `lib/site.ts` and are now
owner-verified fact.

They stay. If a status changes, `lib/site.ts` → `products[].status` is the one
place to change it, and the badge and the product page's eyebrow both follow.

## D16 — Deployed on Vercel

The owner completed the Vercel import; the site is live on its Vercel URL.

`site.url` in `lib/site.ts` is still `https://mugu-labs.com`, which is what the
canonical tags, Open Graph URLs and `sitemap.xml` all advertise. Until that
domain is attached, the deployed site is publishing canonical URLs for a host
that does not resolve. Harmless for a few days, wrong to leave — tracked as
`BACKLOG.md` B11 and resolved either by attaching the domain (PLAN M5) or by
pointing `site.url` at the Vercel URL in the meantime.

## D17 — The hero has its own entrance, off the reveal system

Every other section fades and rises on an IntersectionObserver. The hero does
not, and must not: it is already in view at load, so the observer fires on
hydration and the class often lands in the same frame as first paint — the
text appears rather than arrives. The owner reported exactly that.

The hero animates with CSS keyframes on load: a masked rise, staggered
headline → sub → button, under ~900ms, no JS involved. It runs whether or not
the script loads, and `prefers-reduced-motion` turns it off entirely.

Animated as one block, not per line. Per-line stagger needs the breaks wrapped
in spans, which pins the line break into the markup — and the break is only
deterministic at ≥1280. Copy stays editable without touching layout.

## D18 — Brand marks come from the brands, not from tracings

The Facebook and Instagram glyphs shipped wrong: Facebook's "f" centred with
padding where the mark sits flush to the tile's bottom edge, and Instagram's
camera lighter and smaller than the real one. Comp 9 draws both correctly, so
this was drift in the build, not ambiguity in the design.

Replacements are taken from the brands' own asset pages or a CC0 set that
tracks them (Simple Icons), with the path data inlined — accurate, and no
dependency, so D1 holds. **Reference screenshots are for comparison only; marks
are never traced from them.**

The owner's references live in `docs/site/ref/social/`.

## D19 — Anchor targets clear the fixed nav

The nav is `position: fixed`, so a plain `#section` jump lands the heading
behind it. Every anchor target carries `scroll-margin-top` of at least the nav
height plus breathing room, and the golden harness offsets section captures by
the same amount.

Found by reading an M4 contact sheet, where the clipped heading looked like a
capture-framing artefact and was also a real bug for anyone using the nav.

## D20 — Unfinished links render as placeholders, never as broken links

The owner's call: the six social icons, the journal section and the product
pages **all stay**, and the site ships before their destinations exist.

Shipping unfinished is fine. Shipping something that pretends to work is not.
An `href="#"` is a link that lies — it sits in the tab order, announces itself
as a link, shows a pointer cursor, and jumps the page to the top when clicked.

So a destination that is not yet known is `""` in `lib/site.ts`, not `"#"`, and
the component renders a **non-interactive element** with identical visuals: no
`href`, no `tabindex`, no link role, no hover affordance that implies clicking
does something, and an accessible name that says the link is not there yet.

Adding the real URL to `lib/site.ts` turns it back into a working anchor with
no component edit. That property is the point.

## D21 — No linter; two compiler flags instead

Decided in M5, not deferred. One author, fifteen files, `strict` plus `tsc` in
CI. ESLint's marginal catch here is unused symbols and the React hooks rules,
at the cost of roughly 100 packages and a flat-config migration that Next 16
would force again.

`noUnusedLocals` and `noUnusedParameters` get most of that value for two lines,
and the tree passes clean with both. Revisit if a second person starts
committing.

## D22 — The scroll hint is cut

Removed in M7 at the owner's question. It was a lead addition, in no comp, and
justified as "a web affordance a slide does not need".

That reasoning did not survive looking at a real screenshot: at the scroll
position where the hint sat, the next section was **already visible on screen**.
A prompt to scroll, placed where the reader can already see what scrolling
reveals, is decoration — and it sat alone in a large empty field of gradient,
drawing the eye to the least important thing on the page.

## D23 — Artwork is re-extracted without a background-similarity pass

The 3D illustrations were cut out of the comps by flood-filling the gradient
from the border, then fitting a quadratic background model and deleting every
pixel within a tolerance of it, then a morphological opening.

That last-but-one step is destructive when part of the subject resembles the
background. It ate the calendar's lower body — the owner spotted it as
"feels incomplete", and the comp confirms a clean rounded bottom edge where the
asset has a chewed, ragged one.

**The rule: never delete a pixel merely because it resembles the background.**
A flood fill inward from the border is safe because it only reaches what is
connected to the outside. A global similarity pass is not.

**And the check that would have caught it:** every extracted asset is compared
against its comp region side by side before it ships. Skipping that is why this
survived six milestones of review.

## D24 — YouTube renders as its real mark, not as a square tile

Five of the six social marks are a brand-coloured square with a white glyph.
YouTube is not: its mark **is** a red rounded rectangle, wider than tall, with
the play triangle knocked out. A triangle inside a red square reads as a
generic video-player icon, which is what the owner saw.

Comp 9 draws it correctly — the YouTube slot is the red "tv" silhouette,
visibly wider and shorter than its neighbours. The build matches the comp.

Supersedes the general rule in D18 for this one mark: the tile carries the
brand shape only when the brand's shape is a square.

