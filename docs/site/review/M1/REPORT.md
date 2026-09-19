# M1 — Build truth, then ship

Instructions: `docs/site/lead/NEXT-001-build-and-ship.md`.

## Outcome

**It builds, first try, with no code changes needed. It is committed locally
on `main`. It is NOT yet pushed and CI has NOT yet run** — creating the public
GitHub repo was blocked by Claude Code's permission layer, not by GitHub auth
(which is set up and working). See *Blocked* at the end.

## Ground truth (task 1)

| | |
| --- | --- |
| OS | Windows 11 Pro 10.0.26200 |
| Node | v24.19.0 |
| npm | 11.17.0 |
| git | 2.55.0.windows.3, identity `Dennis <dennismugu7@gmail.com>`, `core.autocrlf=true` |
| gh | 2.97.0, **logged in as `dennismugu7`** (keyring), scopes `gist, read:org, repo, workflow` |

Resolved from `package.json` ranges by `npm install`:

| package | range | resolved |
| --- | --- | --- |
| next | ^15.1.6 | **15.5.25** |
| react | ^19.0.0 | 19.3.0 |
| react-dom | ^19.0.0 | 19.3.0 |
| typescript | ^5.7.3 | 5.9.3 |
| serve (new, dev) | ^14.2.6 | 14.2.6 |

## Commits

| sha | subject |
| --- | --- |
| `2209d21` | Mugu Labs site: the studio one-pager, built from the design comps |
| _(next)_ | M1 gate report |

Both are local only until the push goes through.

## Typecheck (task 2)

Run on a clean tree (`out/`, `.next/`, `tsconfig.tsbuildinfo` removed first):

```
> mugu-labs@1.0.0 typecheck
> tsc --noEmit

TYPECHECK EXIT=0
```

It also passed *before* any of my changes — the `preview/` harness type-checks
cleanly under the root config once `@types/node` is installed.

## Build (task 2)

```
> mugu-labs@1.0.0 build
> next build

   ▲ Next.js 15.5.25

   Creating an optimized production build ...
 ⚠ Compiled with warnings in 5.3s

./styles/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[14].oneOf[10].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[14].oneOf[10].use[3]!./styles/globals.css
Warning

(614:3) autoprefixer: end value has mixed support, consider using flex-end instead

 ✓ Compiled successfully in 11.6s
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (9/9)
   Finalizing page optimization ...
   Collecting build traces ...
 ✓ Exporting (2/2)

Route (app)                                 Size  First Load JS
┌ ○ /                                      175 B         108 kB
├ ○ /_not-found                            131 B         103 kB
├ ● /products/[slug]                       174 B         108 kB
├   ├ /products/dashboard-x
├   ├ /products/bookflow
├   └ /products/oda
├ ○ /robots.txt                            131 B         103 kB
└ ○ /sitemap.xml                           131 B         103 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-a85cef9cc3a04b12.js       46.5 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.99 kB

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)

BUILD EXIT=0
```

The first-ever build (before my changes, cold cache) took 42s to compile and
also exited 0 with the same single warning. The warning is about
`align-items: end` on `.products__head` (`styles/globals.css:614`) — a
stylesheet nit, not a failure; left alone under the "no visual changes" rule.

### What `out/` contains

**50 files, 2,503,509 bytes (2.4 MiB).** 6 HTML pages:

```
out/index.html
out/404.html               (+ out/404/index.html)
out/products/dashboard-x/index.html
out/products/bookflow/index.html
out/products/oda/index.html
out/sitemap.xml
out/robots.txt
out/_next/static/…         21 JS chunks + 1 CSS file
out/assets/                9 PNGs
out/fonts/                 4 TTFs + LICENSE.md
out/favicon.svg
```

Every required path from NEXT-001 is present. All five section anchors
(`products`, `journal`, `about`, `work`, `contact`) are in `index.html` — the
same check CI runs, run locally.

The export was also served with `npm run start` and checked with curl:
`/`, `/products/oda/`, `/sitemap.xml`, `/robots.txt` → 200; `/nope/` → 404.
`robots.txt` and `sitemap.xml` contain the right URLs under
`https://mugu-labs.com`.

## Known risks — what actually happened

| # | Lead expected | Reality | Done |
| --- | --- | --- | --- |
| 1 | `preview/` breaks typecheck | **Did not break.** | Added `"preview"` to `exclude` anyway — it's your stated fix, one line, and it stops a dev-only folder from ever failing the site build. `preview/build.sh` doesn't run `tsc` on the harness, so nothing there changes. |
| 2 | `npx serve out` hits the network | Correct. | `serve@14.2.6` added to **devDependencies**, `start` is now `serve out`. Chose this over a hand-written server because `serve` is Vercel's own static server: clean URLs, trailing slashes and `404.html` behave like production. Cost: 85 extra packages in `node_modules`, dev only. `dependencies` is still exactly `next`, `react`, `react-dom` (D1). |
| 3 | `next lint` has no config | Correct, and `next lint` is deprecated in 15.5 (gone in 16). | Removed the `lint` script. **B8 stays open.** |
| 4 | `output: "export"` fights sitemap/robots/params | **Nothing fought.** Next 15.5.25 wants exactly what the code does — `force-static`, `generateStaticParams`, `params` as a promise. | Nothing. |

The real first-build result: **none of the four risks fired.** The code was
already correct for Next 15.5; the only work was tooling around it.

## Deviations

1. **`preview` excluded from `tsconfig.json` without it having broken** — see
   risk 1 above. Side-effect: nothing type-checks `preview/` any more.
2. **`next-env.d.ts` and `*.tsbuildinfo` added to `.gitignore`.** Next 15.5
   rewrites `next-env.d.ts` on every build (it now references
   `.next/types/routes.d.ts`) and `tsc --incremental` writes
   `tsconfig.tsbuildinfo`. Both would show as modified after every build,
   which would leak into the owner's "three lines" workflow. This matches what
   `create-next-app` ships in 15.5. Verified typecheck passes on a fresh clone
   with neither file present.
3. **README *Deploying* section** now links the GitHub repo and shows
   `git init` / `git add` / `git commit` / `gh repo create --push` as the
   "recreate from scratch" recipe, in place of the PowerShell script.
4. **CI smoke test grep** is `id="<anchor>"` — the literal attribute, which is
   what the built HTML contains. Tighter than a plain word match.
5. `setup-github.ps1` used `dennisxenonxavier7@gmail.com` as a fallback git
   identity; the machine's global git identity is `dennismugu7@gmail.com` and
   that's what the commit carries. No change made.

## Questions for the lead

1. **`npm audit`: 1 high, 1 moderate**, both in `postcss` pulled in by `next`.
   Every Next 15.x depends on the vulnerable range; the only "fix" npm offers
   is `next@16`. The advisories are build-time only (CSS stringify XSS and
   source-map file reads — nothing runs in the exported site). My read: not a
   shipping blocker; decide when to take Next 16 separately.
2. **`align-items: end` → `flex-end`** at `globals.css:614` clears the only
   build warning. Visually identical in every browser that matters. M2?
3. **Line endings.** This machine has `core.autocrlf=true`; every file is
   committed as LF and git warned about CRLF on checkout for all 55 text
   files. A `.gitattributes` with `* text=auto eol=lf` would make this
   deterministic. One line, but it's scope you didn't ask for.
4. **Node.** `engines` says `>=18.18`, CI uses 20, `netlify.toml` says 20,
   this machine runs 24 and the build is fine on it. Want a `.nvmrc`/pin?
5. `preview/build.sh` uses `npx tsx`, which reaches for the network the same
   way `npx serve` did. Harness-only, so I left it. Backlog item?

## Questions only the owner can answer

None for this milestone. The Vercel import is the next owner action and I
have not touched it.

## Checked on the real machine

Everything in this report was run on the owner's machine. Not done: opening
the built site in a real browser — only curl checks. No screenshots were
produced this milestone (none were asked for; visual work is M2).

## Blocked

`gh repo create dennismugu7/mugu-labs-website --public --source=. --remote=origin --push`
was refused by Claude Code's own permission system ("Create Public Surface"),
not by GitHub. `gh` is authenticated and has the `repo` scope, so the command
will work the moment it's allowed to run. No token was asked for or written
anywhere. Once it runs I will confirm the push, wait for CI, and append the
result here.

## Push and CI

Owner ran the `gh repo create … --push` line himself. Repo:
<https://github.com/dennismugu7/mugu-labs-website>, public, `main` tracking
`origin/main`, both commits pushed.

CI run on that push: <https://github.com/dennismugu7/mugu-labs-website/actions/runs/35445664573>
— **success**. Every step green: checkout, setup-node, `npm ci`,
`npm run typecheck`, `npm run build`, "Check the export".

NEXT-002 A2 answered by the same run: typecheck ran on a fresh clone with no
`next-env.d.ts` and no `.next/`, before the build, and passed. No reordering
needed.

**M1 outcome, final: built, pushed, CI green.**
