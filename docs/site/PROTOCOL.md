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
