# NEXT-010 — Placeholders all stay. Make them honest.

Append-only.

**NEXT-009 accepted.** Generating the share image from the built site rather
than hand-placing it is the right instinct — one source of truth, and it stays
correct when the mark or the tagline changes. 780KB PNG → 72KB JPEG for a
gradient-and-grain image is the correct call too.

Flagging the `og:image` absolute URL loudly was right. The owner is attaching
the domain now, so leave it exactly as you did; it fixes itself.

The golden flake — ≤44 pixels, none above 8/255, in a 22×2px patch under the
nav's `backdrop-filter` — is a compositor artefact. Noted so nobody chases it
in three weeks. Do not try to stabilise it.

## The owner's answer, and what it changes

Asked whether to cut the six social icons, the journal section and the product
pages given nothing links anywhere yet, he said: **all stay. Links come later.
The site ships without working links for now.**

That settles scope. It does not settle behaviour, and the difference matters.

Right now those placeholders are `href="#"`. An anchor to `#` is a *link that
lies*: it sits in the tab order, announces itself to a screen reader as a link,
shows a pointer cursor, and when clicked jumps the page to the top for no
reason. Six of those in the socials row, three on the journal cards.

Shipping unfinished is fine. Shipping something that pretends to work is not.

**So: a placeholder renders as a placeholder, not as a broken link.**

- In `lib/site.ts`, change every not-yet-known destination from `"#"` to `""`.
  Empty says "we don't have this yet"; `"#"` says "this is a link" and is a lie.
- In the components, branch on it. A real URL renders an `<a>` exactly as now.
  An empty one renders a **non-interactive element** with identical visuals —
  no `href`, no `tabindex`, no `role="link"`, default cursor, and no hover
  affordance that implies clicking will do something.
- Keep an accessible label that tells the truth, in the manner you judge best —
  the existing `aria-label="Facebook (coming soon)"` pattern is a reasonable
  starting point. A screen reader user should learn the icon is there and not
  yet linked, rather than be handed a link to nowhere.
- This covers: the six socials, the three `posts[].href`, and `site.blogUrl`,
  which currently points at `#journal` — the section it already sits inside, so
  the button scrolls to itself.

Visually **nothing should change** at any width. This is markup and behaviour
only. If a golden hash moves, something changed that should not have.

The moment the owner supplies a URL, dropping it into `lib/site.ts` turns the
placeholder back into a working link with no component edit. That is the
property worth preserving.

Recorded as `DECISIONS.md` **D20**.

## B8 — your opinion is accepted

No linter. Your reasoning holds: one author, fifteen files, `strict` plus `tsc`
in CI, and ESLint's marginal catch here is unused symbols and the hooks rules
at the cost of ~100 packages and a flat-config migration that Next 16 will make
you redo.

**Apply `noUnusedLocals` and `noUnusedParameters`**, since you have already run
the compiler with both and the tree passes clean. Two lines for most of the
value.

Update B8 in `BACKLOG.md` to say it was decided rather than deferred, with the
one-line reason, so nobody re-opens it as an oversight.

## Report

Fold into `docs/site/review/M5/REPORT.md` under NEXT-010, or start M6 if you
prefer — your call, this is small. Either way:

- confirmation that no golden hash moved
- one line on how a placeholder announces itself to assistive technology
- the usual Deployed section

## What is left after this

Genuinely: the domain, and the owner's URLs when he has them. The site is
otherwise finished.

Worth saying plainly, since you have been in it for ten milestones: the work
has been unusually good. The isolation test in M3, catching the 1280px inset
step that my own instruction created, the `--u` token, and pushing back on my
deployment finding with headers from five vantage points — each of those was
the right call made without being told.
