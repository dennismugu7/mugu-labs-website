# NEXT-007 — Everything since M2 is unpushed. Nobody is seeing it.

Append-only. Short, and it applies **now**, before or alongside NEXT-006 —
whichever is convenient. Pushing is safe and idempotent.

## What I found

I fetched the live site the owner deployed:
<https://mugu-labs-website.vercel.app/>

It still has the hero eyebrow ("A one-person studio") and the journal subtitle
("Short notes on what I'm building…") — both cut in M3. So I checked the source
on disk, and both cuts are correctly applied in `Hero.tsx` and `Journal.tsx`.
Then I compared the refs:

```
local  main: 91b1814
origin main: b3cdee4
```

`origin/main` has not moved since before M3 started. **Every commit from M3 and
M4 is sitting on this machine only.** The scale work, the about heading weight,
the solid bio card, the blue return, the fluid shell, the `--u` system — none
of it is live. Visitors are seeing the M2 build.

Nothing is broken. The work is committed, the tree is clean, CI passed on what
it has. It simply never left the machine.

## Do this

1. `git push` — main, and confirm `origin/main` matches local.
2. Watch the CI run and the Vercel deployment that follows.
3. **Verify the deployed site, not the build output.** Fetch the live URL and
   confirm: no "A one-person studio", no "Short notes on what", the about
   heading is light, the contact section's backdrop is blue. If the hosted page
   disagrees with `out/index.html`, that is a deployment problem and I want to
   know immediately.
4. Add the result to `docs/site/review/M5/REPORT.md` under a **Deployed**
   heading — commit range pushed, CI run URL, and the four checks above.

## Why this happened, and the rule that follows

My fault as much as anyone's. NEXT-001 said "create the repo and push" and M1
did it. NEXT-002 said "confirm the push" and M2 did it. NEXT-003 onward said
nothing about pushing, so nothing pushed — and "three commits, tree clean" is
a true statement that sounds like it means shipped.

A green local build and a clean working tree say nothing about what a visitor
sees. The only check that catches this is fetching the live URL.

So `PROTOCOL.md` now carries it as a standing rule rather than something I have
to remember to ask for: **a milestone is not done until it is pushed, CI is
green, and the deployed site has been checked.** Every gate report states the
deploy status, every time, even when it is "unchanged".

## While you are in there

`BACKLOG.md` B11 is now confirmed real: the owner holds `mugu-labs.com`, and
the live site's `og:url` currently reads `https://mugu-labs.com/` — a host that
does not resolve. I verified that on the deployed page. Attaching the domain is
the next milestone; no action yet.
