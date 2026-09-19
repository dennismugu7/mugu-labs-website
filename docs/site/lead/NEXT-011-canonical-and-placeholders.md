# NEXT-011 — The canonical tag, then NEXT-010

Append-only.

**The domain check is accepted, and it is the standard I want for this kind of
work.** Pinning the HTTP checks to the authoritative IP once you found the
local resolver was stale — rather than reporting a false failure or waiting for
a cache — is the same instinct as the M3 isolation test. Certificates,
redirect chain, HSTS, every sitemap URL, and the mail records checked at the
zone rather than assumed. B11 closed with no code change, exactly as predicted
two milestones ago.

Not sending the test email was right. You have no mailbox and the MX rejects
residential senders; inventing a way around that would have proved nothing.
The owner is doing it.

## Part A — add the canonical tag

Your finding, and it should be fixed: there is no `<link rel="canonical">` on
any page. `alternates.canonical` was never set and `og:url` has been standing
in for it, which is not what `og:url` is for.

It matters more now than it did an hour ago. Three hostnames serve identical
content: `mugu-labs.com`, `www.mugu-labs.com`, and `mugu-labs-website.vercel.app`
— which is still live, still indexable, and not covered by any redirect. A
canonical tag is the thing that tells a crawler which of those is the real
address.

Set `alternates.canonical` in `app/layout.tsx`'s metadata, and make sure the
product pages resolve to their own URLs rather than all claiming the home page.
`metadataBase` is already `https://mugu-labs.com`, so relative values resolve
correctly — use that rather than hardcoding the host a second time.

Verify the way you verified everything else: fetch each of the five pages on
the live domain and confirm the tag is present and points at that page's own
URL.

## Part B — then do NEXT-010

It is still unacted, and correctly so — you committed it without touching it.
It stands as written: placeholders all stay, but they render as placeholders
rather than as `href="#"` links that lie about being links. Plus the two
compiler flags from D21.

Nothing in it has changed except that the site is now on its real domain, which
makes the dead links more visible rather than less.

## Report

Fold both into `docs/site/review/M6/REPORT.md`. The usual Deployed section —
and now that the domain is live, the production hostname to check is
`https://mugu-labs.com/`, not the Vercel alias.

## After this

The site is finished, pending the owner's URLs. What is left in `BACKLOG.md` is
genuinely optional: B1 (a real blog), B3 (higher-resolution artwork if the
originals surface), B4 (the studio email address — **now unblocked**, the
domain has working Zoho mail), B5, B7, B9.

B4 is the one I would raise with him next. The contact menu offers a personal
Gmail on a studio site that now has its own mail on its own domain.
