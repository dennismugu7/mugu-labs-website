# Backlog

Deferred. Unlisted means deferred; nothing here is in scope until it is moved
into a `lead/NEXT-*.md`.

| # | Item | Why it's deferred |
| --- | --- | --- |
| B1 | A real blog: `/journal` index, markdown posts, per-post pages | The comps point at an external "mugu labs blog". Until the owner says where the blog actually lives, building one here is inventing scope. |
| B2 | Fonts as `.woff2` instead of `.ttf` | Roughly halves font bytes. Needs `pip install fonttools brotli` and a re-run of `scripts/build-fonts.py --woff2`. Worth doing before any paid traffic. |
| B3 | Higher-resolution artwork | The 3D illustrations and app icons were cut out of 1920×1080 comps, so they are capped at that resolution. If the originals exist, they drop into `public/assets/` under the same filenames. |
| B4 | Studio email address — **unblocked** | D8. The domain has working Zoho mail (MX, SPF, DKIM and DMARC all verified intact after the DNS change). The contact menu still offers a personal Gmail on a studio site that now has its own mail on its own domain. One line in `lib/site.ts` once the owner picks the address. |
| B5 | Analytics | None installed. Deliberate — decide what question you actually want answered first. |
| B6 | Per-product OG images | One shared share image is enough until the product pages get traffic. |
| B7 | Contact form | The email/WhatsApp choice (D7) covers it without a backend. Revisit only if the owner wants submissions logged somewhere. |
| B8 | ~~ESLint config~~ **Decided, D21** | No linter. `strict` + `tsc` in CI, plus `noUnusedLocals` and `noUnusedParameters`, cover what ESLint would catch for one author and fifteen files — without ~100 packages and a flat-config migration Next 16 would force again. Revisit if a second person starts committing. |
| B9 | Next 16 upgrade | `npm audit` reports a high and a moderate in `postcss`, reached through every Next 15.x. Build-time only — nothing from postcss runs in the exported site — and the only remedy npm offers is a major version bump. Taken deliberately, on its own, not as an audit reflex. |
| B10 | `preview/build.sh` calls `npx tsx` | Reaches the network on every run, the same way `npx serve` did before it was fixed. Harness-only, and the harness already needs a network to install. |
| B11 | ~~`site.url` advertises a domain that is not attached~~ **Closed** | Canonical tags, OG URLs and `sitemap.xml` all point at `https://mugu-labs.com` while the site is served from its Vercel URL. Closed when the domain went live — with **no code change**, as predicted. `og:url`, `og:image` and all four sitemap URLs now return 200 on `https://mugu-labs.com`. |
| B12 | Per-line stagger on the hero headline | Proposed in M5: measure line boxes at runtime with Range/getClientRects so no break is pinned in markup. Clever, and declined — D17 moved the hero's entrance off JavaScript precisely because a JS-dependent entrance caused the owner's original complaint. A runtime measurement pass puts the arrival back behind script execution. Revisit only if the entrance ever needs to be JS-driven for another reason. |
