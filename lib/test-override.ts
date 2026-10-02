/**
 * Test-only. tests/e2e builds a second export with this set
 * (scripts/build-flags-fixture.mjs, from tests/e2e/flags-fixture.json) to
 * prove that what the site hides comes back when switched on. NEXT_PUBLIC_
 * so the client bundle sees the same value as the server render. Never set
 * it for a real build.
 */
export type TestOverride = {
  /** Merged over lib/site.ts `features`. */
  features?: { blog?: boolean; socials?: boolean };
  /** Treat every post in content/blog as published (see lib/blog.ts). */
  publishDrafts?: boolean;
  /** Profile URLs by social id, for profiles that have none yet. */
  socialHrefs?: Record<string, string>;
};

export const testOverride: TestOverride = process.env.NEXT_PUBLIC_SITE_TEST_OVERRIDE
  ? JSON.parse(process.env.NEXT_PUBLIC_SITE_TEST_OVERRIDE)
  : {};
