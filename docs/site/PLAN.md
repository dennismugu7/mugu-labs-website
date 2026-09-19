# Plan

The site is written. What remains is proving it builds, getting it published,
and replacing placeholder content with true content.

Every milestone ends at a gate: the builder writes
`docs/site/review/<milestone>/REPORT.md` and stops. The lead reviews and writes
the next `lead/NEXT-*.md`. Gates M3 onward may be non-blocking — the builder
keeps going and the lead's fixes land in the next file.

| Milestone | Outcome | Lead checks |
| --- | --- | --- |
| **M1 — Build truth** | `npm install`, typecheck and `next build` all pass. Repo on GitHub, CI running, Vercel deploying. A URL exists. | Build output real, not skipped. Deviations explained. The live URL renders. |
| **M2 — Visual verification** | Playwright goldens of every section at a fixed logical size, named after the comp they answer to, plus side-by-side contact sheets (comp \| build). | Render scale, type sizes, spacing, icon rendering, gradient seams, the two pinned statements mid-hold, mobile at 390px. |
| **M3 — Content truth** | Placeholders replaced with real values: social URLs, blog destination, product page copy approved or rewritten, contact address. | Nothing still says `#`. Product copy sounds like the owner, not like the lead. |
| **M4 — Polish and performance** | OG/share image, Lighthouse pass, reduced-motion verified, keyboard pass, 404 reachable. | Scores, and the site behaving with motion turned off. |
| **M5 — Domain** | `mugu-labs.com` live with HTTPS, redirects settled, sitemap submitted. | DNS correct, no mixed content, canonical URLs right. |

## Sequencing notes

M1 must complete before anything else — every later milestone assumes a
working build and a deploy pipeline.

M2 and M3 are independent and can run in either order, or together in separate
worktrees if the builder prefers.

M5 depends on the owner owning the domain. If `mugu-labs.com` is not
registered, M5 blocks and the site stays on its Vercel subdomain, which is a
perfectly good place to live in the meantime.

## Per-task definition of done

A task is done when it builds, typechecks, and the change is visible in a
screenshot or a report line. Full builds and handoff docs happen once per
milestone, not once per task.
