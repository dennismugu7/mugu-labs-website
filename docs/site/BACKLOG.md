# Backlog

Deferred. Unlisted means deferred; nothing here is in scope until it is moved
into a `lead/NEXT-*.md`.

| # | Item | Why it's deferred |
| --- | --- | --- |
| B1 | A real blog: `/journal` index, markdown posts, per-post pages | The comps point at an external "mugu labs blog". Until the owner says where the blog actually lives, building one here is inventing scope. |
| B2 | Fonts as `.woff2` instead of `.ttf` | Roughly halves font bytes. Needs `pip install fonttools brotli` and a re-run of `scripts/build-fonts.py --woff2`. Worth doing before any paid traffic. |
| B3 | Higher-resolution artwork | The 3D illustrations and app icons were cut out of 1920×1080 comps, so they are capped at that resolution. If the originals exist, they drop into `public/assets/` under the same filenames. |
| B4 | Studio email address | D8. Replace the personal Gmail once `mugu-labs.com` has mail. |
| B5 | Analytics | None installed. Deliberate — decide what question you actually want answered first. |
| B6 | Per-product OG images | One shared share image is enough until the product pages get traffic. |
| B7 | Contact form | The email/WhatsApp choice (D7) covers it without a backend. Revisit only if the owner wants submissions logged somewhere. |
| B8 | ESLint config | The dead `lint` script was removed in M1 (`next lint` is deprecated in Next 15.5 and gone in 16). No linter is configured. Decide what rules are actually wanted before adding one back. |
| B9 | Next 16 upgrade | `npm audit` reports a high and a moderate in `postcss`, reached through every Next 15.x. Build-time only — nothing from postcss runs in the exported site — and the only remedy npm offers is a major version bump. Taken deliberately, on its own, not as an audit reflex. |
| B10 | `preview/build.sh` calls `npx tsx` | Reaches the network on every run, the same way `npx serve` did before it was fixed. Harness-only, and the harness already needs a network to install. |
