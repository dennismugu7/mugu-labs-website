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

export type ProductStatus = "live" | "in-development";

/** The words for each status, wherever one is shown. */
export const statusLabel: Record<ProductStatus, string> = {
  live: "Live",
  "in-development": "In development",
};

export type Screen = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** A label to group screens under (e.g. seller and buyer screens), shown
   *  over each group; groups show in the order they first appear. None set:
   *  one unlabelled row. */
  group?: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  /** The product's colour: its "Learn more" button and its page's accents.
   *  `onBrandColor` is the text on it; the pair must reach WCAG AA (4.5:1),
   *  which tests/e2e/products.spec.ts checks. */
  brandColor: string;
  onBrandColor: string;
  /** Where "Learn more" goes. Leave as the internal route, or paste a real URL. */
  href: string;
  external?: boolean;
  /** Detail-page content. */
  summary: string;
  /** A heading over the features, e.g. "What we're building". */
  featuresHeading?: string;
  features: { title: string; body: string }[];
  /** A line under the features. */
  smallPrint?: string;
  status: ProductStatus;
  /** The Google Play listing; a live product's page links to it. */
  playStoreUrl?: string;
  /** App screenshots for the product page's gallery, in order. */
  screens: Screen[];
  /** A muted line above the gallery, e.g. that the screens are early designs. */
  screensNote?: string;
  /** schema.org applicationCategory, for the page's SoftwareApplication
   *  structured data (only emitted for an app with a Play listing). */
  appCategory?: string;
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
    // #2EE07E on #0B0B0B: 11.3:1
    brandColor: "#2EE07E",
    onBrandColor: "#0B0B0B",
    href: "/products/dashboard-x",
    updated: "2026-10-02",
    status: "live",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.mugulabs.dashboardx",
    appCategory: "FinanceApplication",
    screens: [
      {
        src: "/assets/dashboard-x/dashboard-x-overview.webp",
        alt: "Dashboard X overview: the total balance, the year's income and expenses, and spending by category in a ring chart",
        width: 720,
        height: 1417,
      },
      {
        src: "/assets/dashboard-x/dashboard-x-transactions.webp",
        alt: "Transactions: money in and out for the year, filters for income, expenses and transfers, and imported entries grouped by day",
        width: 720,
        height: 1417,
      },
      {
        src: "/assets/dashboard-x/dashboard-x-analytics.webp",
        alt: "Analytics: income against spending for each month as a bar chart, with September's in, out and net",
        width: 720,
        height: 1417,
      },
      {
        src: "/assets/dashboard-x/dashboard-x-budget.webp",
        alt: "Budget for September: seven planned lines shown as a ring chart, with the amount for each category",
        width: 720,
        height: 1417,
      },
      {
        src: "/assets/dashboard-x/dashboard-x-import-csv.webp",
        alt: "Importing a bank statement, step one of three: choose the account and the CSV file",
        width: 720,
        height: 1417,
      },
    ],
    summary:
      "A personal finance dashboard for people who gave up on spreadsheets. Bring in your bank statement, see where the money goes, and plan the month before it begins.",
    features: [
      {
        title: "Import, don't type",
        body: "Bring in your bank's CSV statement in three steps: choose the file, match the columns, review. Cash spends? Add them by hand in seconds.",
      },
      {
        title: "See where it goes",
        body: "Your spending broken down by category, with totals and percentages at a glance.",
      },
      {
        title: "Month by month",
        body: "Income against spending for every month of the year, with your net for each.",
      },
      {
        title: "Plan the month",
        body: "Set budget lines per category and see what's planned before the month begins.",
      },
    ],
  },
  {
    slug: "bookflow",
    name: "Bookflow",
    tagline: "Your salon's full calendar, running on autopilot",
    icon: "/assets/icon-bookflow.png",
    // the icon's purple; white on it: 5.0:1
    brandColor: "#9D38EE",
    onBrandColor: "#FFFFFF",
    href: "/products/bookflow",
    updated: "2026-10-02",
    status: "in-development",
    screensNote: "Early designs, still in progress. Shop names and links are examples.",
    screens: [
      {
        src: "/assets/bookflow/bookflow-today.webp",
        alt: "Bookflow's Today screen showing 8 bookings, 23k expected and 3 gaps, with an unpaid-deposit reminder",
        width: 720,
        height: 1280,
      },
      {
        src: "/assets/bookflow/bookflow-booking-detail.webp",
        alt: "A booking with services, an M-Pesa deposit paid and the balance due on the day",
        width: 720,
        height: 1280,
      },
      {
        src: "/assets/bookflow/bookflow-reschedule.webp",
        alt: "Rescheduling a booking to a new time slot, with an SMS sent to the client",
        width: 720,
        height: 1280,
      },
      {
        src: "/assets/bookflow/bookflow-calendar.webp",
        alt: "Team day view with each stylist's bookings side by side",
        width: 720,
        height: 1280,
      },
      {
        src: "/assets/bookflow/bookflow-clients.webp",
        alt: "Client list filtered into new, regular and lapsed clients",
        width: 720,
        height: 1280,
      },
      {
        src: "/assets/bookflow/bookflow-client-profile.webp",
        alt: "A client profile showing visits, total spent and visit history",
        width: 720,
        height: 1280,
      },
    ],
    summary:
      "Bookflow is a booking app for salons, barbers and beauty studios. Share one link, let clients book themselves, and run the whole day from your phone, deposits, changes and all.",
    featuresHeading: "What we're building",
    features: [
      {
        title: "Your day at a glance",
        body: "Open the app and see today's bookings, what you expect to take home, and the free gaps you could still fill. Unpaid deposits get flagged before they cost you a slot.",
      },
      {
        title: "Deposits that protect your time",
        body: "Clients pay a small M-Pesa deposit to hold their slot. If someone doesn't show, you decide: keep the deposit or refund it in a tap.",
      },
      {
        title: "Changes without the chaos",
        body: "Reschedule, move a booking to another stylist, add a service or adjust the price. The client gets an SMS with the new details, so nobody is left guessing.",
      },
      {
        title: "The whole team, side by side",
        body: "A day view with every stylist's bookings in their own column, including who's off and when.",
      },
      {
        title: "A client list that builds itself",
        body: "Everyone who books, whether online, by phone or walk-in, lands in your client list with their visit history. Regulars who've gone quiet are easy to spot.",
      },
      {
        title: "One link, anywhere",
        body: "Put your booking link on WhatsApp or Instagram and appointments land in your calendar automatically.",
      },
    ],
    smallPrint: "Bookflow is still being built with real salons. Features may change before launch.",
  },
  {
    slug: "oda",
    name: "ODA",
    tagline: "Sleek e-commerce checkout, same personal WhatsApp touch",
    icon: "/assets/icon-oda.png",
    // the icon's #DF532C, darkened just enough for white on it: 4.6:1
    brandColor: "#CF461F",
    onBrandColor: "#FFFFFF",
    href: "/products/oda",
    updated: "2026-10-02",
    status: "in-development",
    screensNote: "Early designs, still in progress. Shop names and links are examples.",
    screens: [
      {
        src: "/assets/oda/oda-buyer-shop.webp",
        alt: "A seller's ODA shop page with products, ratings and delivery count",
        width: 720,
        height: 1558,
      },
      {
        src: "/assets/oda/oda-buyer-search.webp",
        alt: "Searching a shop with size and price filters",
        width: 720,
        height: 1558,
      },
      {
        src: "/assets/oda/oda-buyer-cart.webp",
        alt: "A buyer's cart with a free-delivery progress bar",
        width: 720,
        height: 1558,
      },
      {
        src: "/assets/oda/oda-buyer-checkout.webp",
        alt: "Checkout asking only for name, phone number and delivery address",
        width: 720,
        height: 1558,
      },
      {
        src: "/assets/oda/oda-buyer-confirmation.webp",
        alt: "Order placed, with the next steps explained",
        width: 720,
        height: 1558,
      },
      {
        src: "/assets/oda/oda-buyer-tracking.webp",
        alt: "Live delivery tracking with the rider's details and a delivery code",
        width: 720,
        height: 1558,
      },
      {
        src: "/assets/oda/oda-buyer-delivered.webp",
        alt: "Delivered order with a prompt to rate it",
        width: 720,
        height: 1558,
      },
    ],
    summary:
      "ODA gives people who sell on WhatsApp, TikTok and Instagram a shop link of their own. Buyers browse, order and pay with M-Pesa in a few taps, then follow their order all the way to their door. No more chasing screenshots in the chat.",
    featuresHeading: "What we're building",
    features: [
      {
        title: "Your own shop link",
        body: "Products, colours, sizes and prices on one page, with search and filters. Put it in your TikTok bio or Instagram profile; buyers don't need an app.",
      },
      {
        title: "Checkout in a few taps",
        body: "Name, phone number, delivery address. No account needed.",
      },
      {
        title: "Pay with M-Pesa",
        body: "The payment prompt lands on the buyer's phone, and the order page updates by itself once it's paid.",
      },
      {
        title: "Updates on WhatsApp",
        body: "Buyers hear from you on WhatsApp when their order is confirmed and on its way.",
      },
      {
        title: "Live delivery tracking",
        body: "Buyers see their order on the way, and a delivery code makes sure it reaches the right person.",
      },
      {
        title: "Ratings that mean something",
        body: "Only buyers who received their order can rate it, so your rating reflects real deliveries.",
      },
    ],
    smallPrint: "ODA is still being built with real sellers. Features may change before launch.",
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

/** A mailto: link to the studio, with a subject and, optionally, a body. */
export function mailto(subject: string = site.contact.emailSubject, body?: string): string {
  const query = `subject=${encodeURIComponent(subject)}` + (body ? `&body=${encodeURIComponent(body)}` : "");
  return `mailto:${site.contact.email}?${query}`;
}

/** A wa.me link to the studio's WhatsApp, with the first message filled in. */
export function whatsapp(text: string = site.contact.whatsappMessage): string {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** The early-tester request for an app that is still in development. */
export function earlyTesterRequest(productName: string) {
  return {
    message: `Hi Mugu Labs, I'd like to become an early tester for ${productName}.`,
    emailSubject: `Early tester: ${productName}`,
  };
}

export const mailtoHref = mailto();
export const whatsappHref = whatsapp();
