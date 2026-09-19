# NEXT-004 — Resume M3: the code landed, the proof did not

Milestone: **M3**, continued. Append-only. `NEXT-003` still stands — this file
says what is already done and what is left, so nothing gets done twice.

Your previous session closed unexpectedly partway through NEXT-003. I inspected
the working tree over the device bridge before writing this. **Do not start
NEXT-003 over.**

## First, before anything else

**Do not `git checkout`, `reset`, `stash` or `clean` anything.** There is
uncommitted work on disk and it is good work. Your first action is
`git status`, then commit whatever is outstanding — something like:

```
M3: scale for large screens, about heading weight, solid bio card, tint release
```

Commit before you build. If a build goes wrong, I want it recoverable.

## What is already done — verified by me on disk, not assumed

| NEXT-003 item | State |
| --- | --- |
| Part A — scale | **Done.** `@media (min-width: 1280px)` block at the end of `globals.css`: `--shell` 1400px, `--fs-display` cap 8.5rem, `--fs-statement` 5.5rem, `--fs-section` 6rem, `.hero__title` 11ch, `.about__card` 46ch, `.product__icon` to 230px, `.post__art` to 300px with `-5.5rem` margin, `.footer__mark` 120px. Gating it behind 1280px rather than editing the root tokens is better than what I asked for — the "nothing below 1280 changes" constraint is structural now instead of something to re-check. |
| B1 — about heading weight | **Done.** `About.tsx` now uses `section-title about__title`. |
| B2 — solid bio card | **Done.** `.about__card` fill is solid, with the comment explaining why it is the one non-glass card. |
| B3 — tint returns to blue | **Done.** `[data-tint-release]` + the release multiplier in `lib/motion.ts`. |
| Reveal trigger line | **Done.** `rootMargin` −12% → −5%, threshold 0.08 → 0.05. |
| Playwright in `devDependencies` | **Done.** `^1.63.0`. |
| `shots/` gitignored | **Done.** `docs/site/review/goldens/shots/`. |
| `hashes.json` | **Written** — see below, it is not what it looks like. |

**Nothing has been built, captured or reviewed.** No `M3/` review folder
exists. Every change above is unverified.

## The hashes file is a pre-change baseline, and that is lucky

`docs/site/review/goldens/hashes.json` has all 20 entries, but I checked one
against the M2 frame on disk:

```
M2 desktop__01-hero.png  sha256 11abc173…4b8cfc
hashes.json              sha256 11abc173…4b8cfc
```

It was seeded from the **M2 goldens — before any of the scale work**. So it is
not a record of the new render. It is something more useful: a baseline of
exactly what the site looked like before this milestone touched it.

Which turns the whole of Part A into a pass/fail test:

- **All 11 `desktop__*` hashes must change.** If one does not, that section did
  not pick up the scale work.
- **All 9 `mobile__*` hashes must stay identical.** If one moves, the 1280px
  gate leaked and NEXT-003's hard constraint is broken.

Report the comparison as that table. Then overwrite `hashes.json` with the new
values and commit it as the new baseline.

## What is left

1. Commit the outstanding work (above).
2. `npm install` (Playwright is new — the first run downloads a browser),
   `npm run typecheck`, `npm run build`. Report warnings; there should still be
   zero.
3. Re-capture all 20 goldens into `docs/site/review/goldens/shots/`.
4. The hash comparison table above.
5. New sheets for **01, 02, 07, 08, 09, 10** into `docs/site/review/M3/sheets/`.
6. The acceptance check from NEXT-003: at 1920, does the hero headline wrap to
   three lines, and is its cap height within ~10% of comp 1's? Give me the
   numbers, not an impression.
7. `docs/site/review/M3/REPORT.md`.

## Two things to watch, now that the art is much bigger

Both are consequences of Part A that neither of us has seen yet:

- `.post__art` at 300px with `margin-top: -5.5rem` reaches a long way above the
  card. Check it does not collide with the journal subtitle's old position or
  push into the section above.
- `--shell: 1400px` between 1280px and 1440px viewport width leaves very little
  gutter. Capture one extra golden at **1366×768** — the most common cheap
  laptop — and say whether it still breathes.

If either looks wrong, say so and leave it. I decide.

## Note on the cost of this interruption

Almost none, and that is the point of the file relay. The instructions survived
in `lead/`, the work survived on disk, and I could reconstruct the state by
reading the repo rather than asking anyone what happened. `PROTOCOL.md` now has
a short section on resuming, so the next time this happens it is routine.
