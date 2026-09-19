# NEXT-001 — Build truth, then ship

Milestone: **M1**. Read `docs/site/PROTOCOL.md` and `docs/site/DECISIONS.md`
first. This file is append-only — do not edit it, and do not revert anything
under `docs/site/lead/`.

## Context you need

This site was written by a Claude session that **could not run `npm install`** —
network policy blocked the registry. It was verified by server-rendering the
real components with `react-dom/server` and screenshotting them against the
design comps in `docs/site/screens/`. The layout is right. But **`next build`
has never run once** (DECISIONS.md D10).

So: treat the first build as untrusted. Your job this milestone is to make it
true, then get it published. **No visual changes, no refactors, no new
dependencies.** Anything you think should look different goes in your report,
not in the code — visual work is M2.

## Tasks

### 1. Report the ground truth

Node version, npm version, OS, and whether `gh` is installed and authenticated.
No changes yet.

### 2. Make it build

```
npm install
npm run typecheck
npm run build
```

Fix what breaks. Smallest change that makes it correct — see *Known risks*
below for where I expect it to break and what the right fix is. If a fix needs
a judgement call rather than a mechanical correction, make the call, do it, and
write it in the report under *Deviations*.

The build must produce `out/` with, at minimum: `index.html`,
`products/dashboard-x/`, `products/bookflow/`, `products/oda/`, `404.html`,
`sitemap.xml`, `robots.txt`.

### 3. Delete `setup-github.ps1`

The owner does not want PowerShell scripts. You are doing this work instead.
Remove the file and the reference to it in `README.md` (under *Deploying*),
replacing it with the plain git commands.

### 4. Continuous integration

Add a GitHub Actions workflow at `.github/workflows/ci.yml`. It must:

- run on pushes to `main` and on pull requests
- use Node 20 with npm caching
- run `npm ci`, then `npm run typecheck`, then `npm run build`
- fail if `out/index.html` is missing, or if any of the section anchors
  `products`, `journal`, `about`, `work`, `contact` are absent from it

That last check is the cheap smoke test: it catches a section rendering empty,
which is the failure mode that is easy to miss and embarrassing to ship.

Write the file yourself — I am deliberately not pasting YAML through the owner.

### 5. Repo and first commit

`git init` on `main`, commit everything, create **`dennismugu7/mugu-labs-website`,
public**, push.

Commit the whole `docs/site/` tree in the first commit, `lead/` included.

Suggested first commit subject:

```
Mugu Labs site: the studio one-pager, built from the design comps
```

**If GitHub authentication is not already set up on this machine, stop and say
so in the report.** Do not ask the owner to paste a token, and do not write a
token anywhere. `gh auth login` in his own terminal, or Git Credential Manager,
is his call to make.

### 6. Get it deployment-ready, then stop

Confirm in the report that the repo is pushed and CI is green. The Vercel
import itself is an owner action — do not attempt it. I will walk him through
it from your report.

## Known risks, in the order I expect them

1. **`tsconfig.json` type-checks the `preview/` harness.** `include` is
   `**/*.ts` / `**/*.tsx` and `preview/` is not excluded, so `next build` will
   typecheck a dev-only folder that imports `react-dom/server` and uses
   `__dirname`. Fix: add `"preview"` to `exclude` in the root `tsconfig.json`.
   The harness has its own `preview/tsconfig.json` and keeps working.

2. **`npm run start` is `npx serve out`** — `serve` is not a dependency, so the
   script reaches out to the network on every run. Fix: make it serve `out/`
   with something already present, or add `serve` to `devDependencies` and use
   it properly. Your call; say which in the report.

3. **`npm run lint` has no ESLint config.** `next lint` will either prompt
   interactively or fail. It is not in CI, so it will not block you. Either
   configure ESLint or remove the script — this is `BACKLOG.md` B8, so removing
   it and leaving B8 open is a fine answer.

4. **`output: "export"` interactions.** `app/sitemap.ts` and `app/robots.ts`
   carry `export const dynamic = "force-static"`; `app/products/[slug]/page.tsx`
   has `generateStaticParams` and treats `params` as a promise (Next 15 shape).
   If any of these fight the exporter, fix them to whatever the installed Next
   version actually wants, and note the version in the report.

If the real failure is none of these, that is useful information — say so
plainly.

## Report

Write `docs/site/review/M1/REPORT.md` containing:

- **Outcome** in one line: did it build, is it pushed, is CI green
- Versions: node, npm, and the `next` / `react` versions that actually resolved
- Commit list for the milestone
- Typecheck and build results — paste the real output, not a summary
- What `out/` contains: page count and total size
- **Deviations** from these docs, and why
- **Questions for the lead** — anything you want decided
- **Questions only the owner can answer** — keep this list short and in plain
  language; I translate it, you do not ask him directly

Then stop. The owner will send me two words and I will write NEXT-002.

## What I already know is unfinished

Do not fix these now. They are M3, and they need the owner's answers, not your
judgement:

- Every social URL in `lib/site.ts` is `"#"`
- `site.blogUrl` points back at the page's own anchor
- Every `posts[].href` is `"#"`
- The product detail page copy was drafted by me from the comp taglines. It is
  plausible, not true. The owner has to read it.
