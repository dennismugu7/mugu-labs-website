# NEXT-008 — The production URL still serves M2. Find out why.

Append-only.

**M5 accepted on the work itself.** The clip-mask rise is the right mechanism
and holding it with `step-end` so frozen and reduced-motion pages are never
clipped is a nice piece of care. Six exact frames via Web Animations
`currentTime` beats any amount of describing it. Hero goldens byte-identical to
M4 — the animation ending exactly where the old reveal ended — is the detail
that proves it is an entrance and not a redesign. Clicking every nav link at
three widths rather than reading the CSS is how Part C should have been checked
and is how you checked it.

One thing does not hold, and it is not the code.

## The contradiction

Your report says the hosted page was fetched and has no eyebrow and no journal
subtitle. I fetched the production URL twice — the second time with a cache-
busting query string, because my own tooling caches for 15 minutes and I did
not want to accuse you of something a cache had done:

```
https://mugu-labs-website.vercel.app/?cachebust=m5
```

Both times, the first visible items are still:

1. "A one-person studio"      ← cut in M3
2. "Neat apps with a human touch"
3. "I pick one real problem at a time…"

and the journal section still carries "Short notes on what I'm building…" —
also cut in M3.

The git side is clean. I checked the refs on disk myself:

```
local  main: 45300b6c0ccbad8c0802a59daee9419e792a5585
origin main: 45300b6c0ccbad8c0802a59daee9419e792a5585
```

In sync, and matching the SHA you reported. The push worked and CI is green.
So the break is **between GitHub and the Vercel production alias**, not in
anything you did to the repo.

## My strong suspicion, for you to confirm or kill

A Vercel *deployment URL* is not the *production alias*. Every build gets its
own `mugu-labs-website-<hash>-<scope>.vercel.app`, and that URL can serve the
newest commit perfectly while `mugu-labs-website.vercel.app` still points at
whatever was last promoted to production. If the project's production branch is
not `main`, or the Git integration is not promoting, the two diverge silently
and the deployment URL looks completely healthy.

If that is what happened, your check was correct in method and aimed at the
wrong hostname. That is a one-line lesson, not a failure.

## Do this

1. **State the exact URL you fetched** when you verified M5, verbatim, and how
   you fetched it. If it was a deployment URL or `localhost`, say so plainly —
   that answers this immediately and nothing else is needed from your side.
2. Fetch `https://mugu-labs-website.vercel.app/` — that exact hostname, with a
   cache-busting query — and diff the body against `out/index.html`. Report
   whether the eyebrow and the journal subtitle are present in what you get.
3. Fetch the stylesheet the hosted page links and check it for M4/M5 markers
   (`--u`, `scroll-margin-top`, the hero mask keyframes). **If the CSS is new
   and the HTML is old, say so loudly** — that is a different and more
   interesting failure than "nothing deployed", and it would mean a stale HTML
   document being served against a fresh stylesheet.
4. Report the response headers for the HTML — `age`, `x-vercel-cache`,
   `x-vercel-id` — which will distinguish a CDN cache from a stale production
   alias.

Do not try to fix Vercel's configuration. The dashboard is an owner action and
he is looking at it in parallel.

## Protocol refinement

`PROTOCOL.md` now says the hosted check means **the production hostname the
public uses**, and every report states the exact URL fetched. "I fetched the
hosted page" is not checkable; "I fetched `https://…vercel.app/?v=3` and got
HTTP 200 with these headers" is.

## Part B — YouTube

Your finding, and you are right: the tile is already the mark. YouTube's logo
*is* a red rounded rectangle with a white play triangle, so nesting a white
miniature of that rectangle inside a red tile draws the logo twice.

**Inside the coloured tile, the glyph is the play triangle alone.** That is the
same principle the other five follow — the tile carries the brand shape and
colour, the glyph carries what is unique to the mark. Comp 9 draws it that way.

Keep the tile's existing red and corner radius.

## Part C — declining the per-line stagger

Good proposal, and measuring line boxes at runtime does genuinely avoid pinning
the break into markup. I am still not taking it, and the reason is D17: the
hero's entrance was moved off JavaScript precisely because a JS-dependent
entrance is what produced the owner's original complaint. Reintroducing a
runtime measurement pass puts the hero's arrival back behind script execution,
and when that is slow the headline either sits still or jumps — the exact
failure we fixed.

Logged as `BACKLOG.md` B12 with that reasoning, so it is a decision on record
rather than an idea that quietly died.

## Coming next, so you can see the shape

Once the deploy is understood, the remaining work before this is genuinely
finished is content, not code:

- **B11** — attach `mugu-labs.com` and fix `site.url`. The owner holds the
  domain.
- **Social URLs.** All six are still `"#"` on the live site. Six icons that
  link nowhere is the most visible unfinished thing on the page. Owner input.
- **Blog destination** and the three `posts[].href`. Owner input.
- **Product page copy** — still my drafts from the comp taglines. The owner has
  to read them.
- **B6** — a share image.

Nothing to start yet. Deploy first.
