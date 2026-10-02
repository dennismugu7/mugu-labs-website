import { features, socials } from "./site";
import { testOverride } from "./test-override";

/**
 * Whether the home page shows its socials section, from the flag in
 * lib/site.ts (`features`) and whether any profile has a URL. (The blog's
 * equivalent is blogVisible() in lib/blog.ts, which reads content/blog.)
 */

const flags = { ...features, ...testOverride.features };

/** Profiles with a URL; the rest are not shown. */
export const linkedSocials = socials
  .map((social) =>
    testOverride.socialHrefs?.[social.id] ? { ...social, href: testOverride.socialHrefs[social.id] } : social
  )
  .filter((social) => social.href);

export const showSocials = flags.socials && linkedSocials.length > 0;
