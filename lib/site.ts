/**
 * Everything you'll want to edit lives in this one file.
 * Change copy, links, products and posts here — no component edits needed.
 */

export const site = {
  name: "Mugu Labs",
  domain: "mugu-labs.com",
  url: "https://mugu-labs.com",
  tagline: "Neat apps with a human touch",
  description:
    "Mugu Labs is a small, independent app studio. We pick one real problem at a time, ship something usable, and keep working on it long after launch.",

  /** ---- Contact ------------------------------------------------------- */
  contact: {
    email: "support@mugu-labs.com",
    /** International format, digits only — used to build the wa.me link. */
    whatsapp: "254701408727",
    whatsappDisplay: "+254 701 408 727",
    /** Pre-filled first message. */
    whatsappMessage: "Hi Mugu Labs, I found your website and I'd like to talk about an app.",
    emailSubject: "Let's build something",
  },

  /** ---- Author: the page metadata's author (<meta name="author">) ---- */
  author: {
    name: "Dennis Mburu",
    githubUrl: "https://github.com/dennismugu7",
  },

  /** ---- "Made by humans" --------------------------------------------- */
  bio: "Mugu Labs began when Dennis Mburu got tired of clunky, overcomplicated software and started coding his own. It has since grown into a small team building calm, useful apps, designed, built and tested by real people.",

  /** ---- Blog ----------------------------------------------------------
   *  Paste the blog's URL when it exists. Empty means "not yet": the button
   *  renders as a placeholder rather than a link (DECISIONS D20). */
  blogUrl: "",

  /** When the home page's content last changed (YYYY-MM-DD) — the sitemap's
   *  lastmod. Bump it with the copy; a build date would claim every page
   *  changed on every deploy. */
  updated: "2026-10-02",
} as const;

/** ---- Team -------------------------------------------------------------
 *  One card per person in "Made by humans". With an `avatar` the card shows
 *  the photo; without one, `monogram` in the brand gradient. `name` and
 *  `github` are optional.
 * ---------------------------------------------------------------------- */

export type TeamMember = {
  name?: string;
  role: string;
  avatar?: string;
  monogram?: string;
  /** GitHub username, without the @. */
  github?: string;
};

export const team: TeamMember[] = [
  { name: "Dennis Mburu", role: "Lead Developer", avatar: "/assets/avatar.png", github: "dennismugu7" },
  { role: "Collaborator", monogram: "ML" },
];

/** ---- Products -------------------------------------------------------- */

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  /** Visual accent for the card's button: "lime" | "navy" */
  accent: "lime" | "navy";
  /** Where "Learn more" goes. Leave as the internal route, or paste a real URL. */
  href: string;
  external?: boolean;
  /** Detail-page content. */
  summary: string;
  features: { title: string; body: string }[];
  /** One label per state, shown on the card and the product page. */
  status: "Live" | "In development";
  /** When this product's page content last changed (YYYY-MM-DD), for the
   *  sitemap. Bump it with the copy. */
  updated: string;
};

export const products: Product[] = [
  {
    slug: "dashboard-x",
    name: "Dashboard X",
    tagline: "Taming your budget and tracking spending is now a breeze",
    icon: "/assets/icon-dashboardx.png",
    accent: "lime",
    href: "/products/dashboard-x",
    updated: "2026-10-02",
    status: "Live",
    summary:
      "A personal finance dashboard for people who gave up on spreadsheets. Snap a receipt, and the amount, the merchant and the category are in before you've put your phone back in your pocket.",
    features: [
      {
        title: "Scan, don't type",
        body: "Point the camera at a receipt. Dashboard X reads the total, the date and the merchant, and files it where it belongs.",
      },
      {
        title: "Categories that learn",
        body: "Correct a category once and it sticks. No rules engine to configure, no tagging chores on a Sunday evening.",
      },
      {
        title: "One number that matters",
        body: "The home screen answers a single question — can I spend this? — instead of showing you eleven charts.",
      },
      {
        title: "Works offline",
        body: "Everything runs on-device first and syncs when there's signal. Built for a commute, not a fibre connection.",
      },
    ],
  },
  {
    slug: "bookflow",
    name: "Bookflow",
    tagline: "Your salon's full calendar, running on autopilot",
    icon: "/assets/icon-bookflow.png",
    accent: "navy",
    href: "/products/bookflow",
    updated: "2026-10-02",
    status: "In development",
    summary:
      "Booking software shaped like a salon day rather than an enterprise calendar. Clients pick a slot, Bookflow confirms it, reminds them, and quietly chases the ones who go quiet.",
    features: [
      {
        title: "A link, not an app download",
        body: "Clients book from the link in your bio. Nothing to install, nothing to sign up for, nothing to explain twice.",
      },
      {
        title: "Reminders that cut no-shows",
        body: "Automatic nudges the day before and the morning of, in the channel your clients actually read.",
      },
      {
        title: "Your real hours",
        body: "Lunch, walk-ins, a chair that's out, a stylist who only works Thursdays — the schedule bends to the shop.",
      },
      {
        title: "Money in plain sight",
        body: "Deposits, balances and the week's take, without exporting anything into a spreadsheet.",
      },
    ],
  },
  {
    slug: "oda",
    name: "ODA",
    tagline: "Sleek e-commerce checkout, same personal WhatsApp touch",
    icon: "/assets/icon-oda.png",
    accent: "lime",
    href: "/products/oda",
    updated: "2026-10-02",
    status: "In development",
    summary:
      "A storefront and checkout for sellers whose business already lives in WhatsApp. Customers get a proper product page and a real cart; you keep the conversation you've always had.",
    features: [
      {
        title: "Checkout, then chat",
        body: "The order lands as a clean, itemised WhatsApp message — no more scrolling back to work out what someone wanted.",
      },
      {
        title: "Catalogue in minutes",
        body: "Photos, prices, variants. Paste them in once and share a link that looks like you meant it.",
      },
      {
        title: "Mobile money first",
        body: "Built around how people actually pay here, not bolted on after the card form.",
      },
      {
        title: "Nothing to abandon",
        body: "No accounts, no passwords, no six-step funnel. The shortest path from interested to paid.",
      },
    ],
  },
];

/** ---- Journal / blog teasers ------------------------------------------ */

export type Post = {
  title: string;
  art: string;
  alt: string;
  tags: string[];
  /** The post's URL, or "" while the blog does not exist yet (D20). */
  href: string;
};

export const posts: Post[] = [
  {
    title: "Click, Scan, Budget: Turn receipts into instant financial peace of mind",
    art: "/assets/art-budget.png",
    alt: "Illustration of a budget chart with coins and a magnifying glass",
    tags: ["Dashboard X", "Smart Moves & Quick Hacks", "Money tips"],
    href: "",
  },
  {
    title: "Ditch the Clunky Spreadsheet: Level up your bank sync so your accounts actually talk to each other",
    art: "/assets/art-sync.png",
    alt: "Illustration of two arrows circling a dollar sign",
    tags: ["Dashboard X", "Smart Moves & Quick Hacks", "Money tips"],
    href: "",
  },
  {
    title: "Less Drama, More Glam: We built the exact booking tools you asked for.",
    art: "/assets/art-calendar.png",
    alt: "Illustration of a calendar with a notification bell",
    tags: ["Bookflow", "Smart Moves & Quick Hacks", "Beauty Cheat Codes"],
    href: "",
  },
];

/** ---- How we work ----------------------------------------------------- */

export const principles = [
  {
    title: "We use the thing first",
    body: "Every product starts with a real business sitting next to us while we build it.",
  },
  {
    title: "Small, then smaller",
    body: "One job done properly beats a feature list nobody finishes reading.",
  },
  {
    title: "Built to be left alone",
    body: "Apps that quietly do their job behind your back, even on a five-year-old Android.",
  },
];

/** ---- Socials ---------------------------------------------------------
 *  Paste the real profile URLs here. An entry left as "" renders the tile
 *  as a placeholder — identical to look at, but not a link — and tells a
 *  screen reader it is not linked yet (DECISIONS D20).
 * ---------------------------------------------------------------------- */

export const socials = [
  { name: "Facebook", href: "", id: "facebook" },
  { name: "Instagram", href: "", id: "instagram" },
  { name: "X", href: "", id: "x" },
  { name: "YouTube", href: "", id: "youtube" },
  { name: "LinkedIn", href: "", id: "linkedin" },
  { name: "Discord", href: "", id: "discord" },
] as const;

/** ---- Feature flags -----------------------------------------------------
 *  Sections that stay off the site until they have something to show. A
 *  section switched off is not rendered at all, and its links go with it
 *  (the nav's "Journal", in the header and the phone menu); a visit to
 *  /#journal or /#connect lands at the top of the home page instead.
 *
 *  To bring one back, set its flag to true AND give it something to show:
 *    blog    — at least one post above with an `href` (a published post);
 *              only published posts are listed.
 *    socials — at least one profile above with an `href`; profiles without
 *              one stay hidden.
 *  A flag that is on with nothing to show still hides the section. Nothing
 *  else to change: lib/sections.ts works out the rest.
 * ---------------------------------------------------------------------- */

export const features = {
  blog: false,
  socials: false,
};

/** ---- Derived links --------------------------------------------------- */

export const mailtoHref = `mailto:${site.contact.email}?subject=${encodeURIComponent(
  site.contact.emailSubject
)}`;

export const whatsappHref = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
  site.contact.whatsappMessage
)}`;
