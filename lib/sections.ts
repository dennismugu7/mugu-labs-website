import { features, posts, socials } from "./site";

/**
 * Which optional sections the home page shows, from the flags in
 * lib/site.ts (`features`) and whether there is anything to put in them.
 * The home page, the nav and the phone menu all read these, so a hidden
 * section and its links always disappear together.
 */

/**
 * Test-only. tests/e2e builds a second export with this set
 * (scripts/build-flags-fixture.mjs, the fixture in
 * tests/e2e/flags-fixture.json) to prove the hidden sections come back when
 * switched on. NEXT_PUBLIC_ so the client bundle (the nav) sees the same
 * value as the server render. Never set it for a real build.
 */
type TestOverride = {
  features?: Partial<typeof features>;
  postHrefs?: string[];
  socialHrefs?: Record<string, string>;
};

const override: TestOverride = process.env.NEXT_PUBLIC_SITE_TEST_OVERRIDE
  ? JSON.parse(process.env.NEXT_PUBLIC_SITE_TEST_OVERRIDE)
  : {};

const flags = { ...features, ...override.features };

/** Posts with somewhere to go. */
export const publishedPosts = posts
  .map((post, i) => (override.postHrefs?.[i] ? { ...post, href: override.postHrefs[i] } : post))
  .filter((post) => post.href);

/** Profiles with a URL; the rest are not shown. */
export const linkedSocials = socials
  .map((social) => (override.socialHrefs?.[social.id] ? { ...social, href: override.socialHrefs[social.id] } : social))
  .filter((social) => social.href);

export const showBlog = flags.blog && publishedPosts.length > 0;
export const showSocials = flags.socials && linkedSocials.length > 0;
