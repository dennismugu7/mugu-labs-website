# Protocol — how this repo is worked on

Three roles. Read this once; it does not change.

| Who | Is | Does | Never does |
| --- | --- | --- | --- |
| **Owner** | Dennis, usually on a phone | Product calls, relays two-word messages, account-bound actions (GitHub auth, Vercel sign-in, domain, store logins), final "go" | Write prompts, read code, run terminals |
| **Lead** | A Claude Cowork session | Decides, reviews, writes instruction files, reads this repo and screenshots directly over the device bridge, translates everything into plain language | Write app code, touch production |
| **Builder** | Claude Code, on the owner's computer | Audits, plans, codes, tests, builds, writes gate reports | Make product decisions, touch production without an explicit relayed "go" |

## The relay

1. Builder finishes a milestone → writes `docs/site/review/<milestone>/REPORT.md` plus any screenshots and an `INDEX.md` beside them.
2. Owner sends the lead two words: **"M1 done"**.
3. Lead reads the report and screenshots straight from this repo, reviews, and writes the next instructions as a **new** file in `docs/site/lead/`.
4. Owner tells the builder: **"Read docs/site/lead/NEXT-00N-<name>.md and go."**

## Rules for the builder

These come from real failures on a previous build. They are not negotiable.

- **Never `checkout`, `stash`, `reset` or `clean` anything under `docs/site/lead/`.** A previous builder restored that folder from git twice and silently wiped the lead's instructions. Commit new files there as soon as you see them.
- **Never edit a `NEXT-*.md` file.** They are an append-only record. The lead writes a new filename every time.
- If a `NEXT-*.md` file appears that you have not acted on, act on it — do not assume it is stale.
- If you believe there is "nothing new to act on", check what is actually on disk before saying so.
- Write reports to `docs/site/review/<milestone>/REPORT.md`. One folder per milestone, never overwritten.

## Resuming after a session ends mid-task

A builder session can close unexpectedly. It costs almost nothing here, because
the instructions live in `lead/` and the work lives on disk — but only if the
restart is handled as a resume rather than a restart.

- **The lead reads the working tree first** and writes a new `NEXT-*.md` that
  states what is already done. The builder does not re-derive it and does not
  start the previous file over.
- **The builder never `checkout`s, `reset`s, `stash`es or `clean`s to "get back
  to a known state".** Uncommitted work from the dead session is the most
  valuable thing in the repo at that moment. Commit it first, then carry on.
- **Committed hashes and reports are the memory.** A baseline written before a
  change is not stale — it is the before-picture, and it is usually the fastest
  way to prove the change did what it claimed.

## Acceptance tests must isolate one variable

A test that cannot isolate what it claims to measure is not a test, and a good
build should not fail against it.

- **The builder says so rather than reporting a false failure.** If the lead's
  criterion is confounded — the commit carries other changes that legitimately
  affect the same surface — run the test that does isolate the variable, and
  report both the criterion as written and the one you actually ran.
- **The technique for a gated change**: remove the gate, build, capture, restore
  the source byte-for-byte, rebuild. Identical output with and without the gate
  proves the gate held, regardless of what else moved in the commit.
- **Attribute every remaining diff.** "Six hashes moved" is not a finding;
  "six hashes moved, here is which change caused each" is.

## A milestone is not done until it is deployed

Committed is not pushed. Pushed is not deployed. Deployed is not verified.

"Three commits, tree clean" is a true sentence that sounds like shipped, and it
is not — M3 and M4 both passed their gates while sitting unpushed on one
machine, and the live site served the M2 build for two milestones.

Every gate report ends with a **Deployed** section stating:

- the commit range pushed, and that `origin/main` matches local
- the CI run and its result
- that the **production hostname the public uses** was fetched and checked —
  not the local `out/` directory, not the build log, and **not a per-deployment
  preview URL**, which can serve the newest commit while the production alias
  still points somewhere older
- **the exact URL fetched, verbatim**, with a cache-busting query. "I fetched
  the hosted page" is not checkable; "I fetched `https://…/?v=3`, HTTP 200,
  `x-vercel-cache: MISS`" is

"Unchanged this milestone" is a valid answer. Silence is not. A green build and
a clean tree say nothing about what a visitor sees; only fetching the live URL
does.

## When the lead and the builder disagree about what a URL serves

This happened. The lead fetched the production URL twice, saw two-milestone-old
content, and opened an investigation into a deployment that was perfectly
healthy. The builder was right.

The asymmetry that caused it, and the rule that follows:

- **The lead's fetching tool has a cache the lead cannot see, inspect or
  reliably bust**, and it returns a *summary of rendered content* — never
  response headers. The lead cannot produce an `Etag`, an `Age` or an
  `X-Vercel-Cache` value. Not "did not"; **cannot**. The builder should never
  wait on the lead for header evidence.
- **The builder's `curl` is the stronger instrument.** Status, `Age`,
  `X-Vercel-Cache`, `Etag`, forced IPv4/IPv6, encoding variants, a second
  vantage point — that is evidence. A content summary from a caching proxy is
  an observation.
- **So: headers win.** When the two disagree about what a hostname serves, the
  side holding response headers is right until something with headers says
  otherwise. The lead re-tests with a never-before-used URL before concluding
  anything, and says plainly when it was the one that was wrong.
- **The builder is expected to push back like this** — with evidence, from
  several angles, naming the most likely cause including "the lead's tooling".
  That is the job, not insubordination.

## Scope rule

Ship what is in the design comps under `docs/site/screens/`, plus only what those comps need in order to function.

Anything proposed in a doc but not drawn is either **IN** (with a written reason) or **DEFERRED** to `BACKLOG.md`. Unlisted means deferred. The builder does not invent scope.

## Precedence, when sources disagree

`DECISIONS.md` > design comps > this protocol > existing code.

If the code and a comp disagree, the comp wins and the builder writes the deviation into its report. If a comp and `DECISIONS.md` disagree, `DECISIONS.md` wins.

## Gate reports must contain

- Commit list for the milestone
- Typecheck result, build result, and what the build produced (path, page count, total size)
- Screenshot index, if the milestone produced screenshots
- Deviations from these docs, and why
- Questions for the lead — separated into *"lead can answer"* and *"only the owner can answer"*
- Anything that could only be checked on the real machine, logged explicitly

## Asking the owner

Only ask the owner for what only the owner can know: business facts, taste calls, credentials, account actions, what a real device did. Never hand him a menu of technical options. Never ask him to open a terminal unless there is genuinely no alternative. Give him numbered, phone-doable steps and exact paste-ready text.
