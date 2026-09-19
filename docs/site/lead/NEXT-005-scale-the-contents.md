# NEXT-005 — The second scale round, and a step I put in your way

Milestone: **M4**. Append-only.

**M3 accepted.** Hero at 95px against the comp's 99px, three lines as drawn,
measured off the frames by N-stem row count rather than read out of the CSS.
That is the right way to check it and the number is better than I asked for.

## First: my acceptance test was wrong, and you were right to break it

I wrote *"all 9 mobile hashes must stay identical"*. That was a badly specified
test and it would have failed a correct build. The same commit carried Part B
and the Part C cuts, which are **ungated by design** and must change a phone.
My criterion conflated two different claims — "the 1280px gate held" and
"mobile did not change" — and only the first one was ever true.

You ran the test I should have written: delete the entire
`@media (min-width: 1280px)` block, build, capture, restore the CSS
byte-for-byte, rebuild. All 9 mobile goldens identical with and without it.
That isolates one variable and proves the gate. Then you located the six real
diffs by pixel-diff and attributed each one.

I verified the restore myself before writing this — `globals.css` is the same
byte length as before the experiment and the media block is intact.

This is now a rule in `PROTOCOL.md`: an acceptance test that cannot isolate one
variable is not a test, and the builder should say so rather than fail a good
build against it.

## Part A — the 1280px step

Your finding, and it is the most important thing in the report: side room drops
from ~70px at 1279 to 20px at 1280. The gate made the site *tighter* at exactly
the width where it was supposed to get more generous, and 1366×768 is a very
common cheap laptop.

Cause: `--shell: 1400px` is a hard value, so between 1280 and 1440 the shell
fills the viewport and the only inset left is the 20px gutter.

**Fix: make the shell fluid so the inset never steps.**

```
--shell: min(1400px, 100vw - 100px);
```

That `100px` is not arbitrary — it makes the transition exactly continuous.
Content inset is `(viewport − shell) / 2 + gutter`, so below 1400 the inset
settles at `50 + 20 = 70px`, which is what 1279 already gives. At 1280 it is
70px, at 1366 it is 70px, at 1500 it is 70px, and from there it grows to 280px
at 1920. No step, anywhere.

Verify with goldens at **1280, 1366 and 1440** — that band is load-bearing now,
so it gets permanent coverage alongside the laptop frame you already added.

## Part B — the hero line break

Take the comp's break. `text-wrap: balance` is choosing an even rag and giving
"with a" — a line of nothing but function words — where the comp reads
"Neat apps / with a human / touch". You measured that "with a human" fits with
55px to spare, so natural wrapping gets there on its own.

Inside the ≥1280 block only:

```
.hero__title { text-wrap: wrap; }
```

Leave `balance` alone everywhere else — it is doing good work on the statements
and section titles. And leave it alone below 1280: the mobile hero already
wraps to three lines and I do not want those hashes moving for a desktop
concern. If they move anyway, that is a finding, not a fix.

## Part C — scale the contents, not just the boxes

This is the real body of the milestone and it is your finding: M3 scaled
headings, shell and art, so card bodies, buttons, social icons and the contact
card's contents are still M2-sized inside bigger boxes. Sheets 09 and 10 show
it plainly — the boxes grew and the things inside them did not.

Same method as M3: **change the system, re-capture, show me what fell out.**
Do not tune ten rules individually.

In scope, all inside the ≥1280 block:

- card body text and `.principle__body`
- buttons — `.btn` min-height, padding and font-size
- social icons
- the contact card: envelope art, title and button
- the journal tag pills
- product card name, tagline and icon
- `.author` chip — avatar, name, role, handle
- footer link row and copyright line

**Journal art, specifically.** It renders at 230px because `12vw` never reaches
the 300px cap at 1920. Against a ~430px card that is a ratio of about 0.53,
where comp 7 draws roughly 0.92. Bring it toward the drawn proportion, and give
it **at least 40px** of clearance to the heading — 15px between the "g" of
"blog" and the calendar ring is too tight to leave alone.

Reference the comps for proportion, not for pixels. The comps are 1920 slides;
we are matching impression per D12.

## Part D — report

`docs/site/review/M4/REPORT.md`, plus:

- fresh sheets for **02, 07, 09, 10** — where the contents were undersized
- goldens at 1280, 1366, 1440 with the inset measured at each, showing no step
- the hero break, before and after
- the mobile hash table again. Mobile should be **unchanged this time** — every
  item in Parts A–C is inside the gate. If a mobile hash moves, something
  leaked, and that is worth stopping for.

## Accepted without change

The 0.3% anti-aliasing shimmer on three comp-9 reveal elements — noted, not
chased. `laptop__01-hero.png` as a permanent golden — good call, keep it. The
`sheets.py` relative-path fix. B6 still not started, which is fine.

## Still waiting on the owner

Not blockers for this milestone. He has been asked twice; I will ask once more
and then stop:

1. Vercel import — the site is still not deployed anywhere.
2. The photographic texture behind the contact card in comp 10 — his asset or
   slide-template stock?
3. Whether the LIVE / IN BUILD badges are true.
