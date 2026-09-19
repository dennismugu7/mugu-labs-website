/**
 * Everything you'll want to edit lives in this one file.
 * Change copy, links, products and posts here — no component edits needed.
 */

export const site = {
  name: "Mugu labs",
  domain: "mugu-labs.com",
  url: "https://mugu-labs.com",
  tagline: "Neat apps with a human touch",
  description:
    "Mugu Labs is a one-person studio. I pick one real problem at a time, ship something usable, and keep working on it long after launch.",

  /** ---- Contact ------------------------------------------------------- */
  contact: {
    email: "dennisxenonxavier7@gmail.com",
    /** International format, digits only — used to build the wa.me link. */
    whatsapp: "254701408727",
    whatsappDisplay: "+254 701 408 727",
    /** Pre-filled first message. */
    whatsappMessage: "Hi Dennis — I found Mugu Labs and I'd like to talk about an app.",
    emailSubject: "Let's build something",
  },

  /** ---- Author -------------------------------------------------------- */
  author: {
    name: "Dennis Mburu",
    role: "Developer",
    github: "dennismugu7",
    githubUrl: "https://github.com/dennismugu7",
    avatar: "/assets/avatar.png",
    bio: "Mugu Labs started out of personal necessity — I was tired of clunky, overcomplicated software, so I started coding my own solutions. What began as a personal habit quickly turned into a studio dedicated to clean design and effortless utility.",
  },

  /** ---- Blog ---------------------------------------------------------- */
  blogUrl: "#journal",
} as const;

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
  status: string;
};

export const products: Product[] = [
  {
    slug: "dashboard-x",
    name: "Dashboard X",
    tagline: "Taming your budget and tracking spending is now a breeze",
    icon: "/assets/icon-dashboardx.png",
    accent: "lime",
    href: "/products/dashboard-x",
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
    status: "Live",
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
    status: "In build",
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
  href: string;
};

export const posts: Post[] = [
  {
    title: "Click, Scan, Budget: Turn receipts into instant financial peace of mind",
    art: "/assets/art-budget.png",
    alt: "Illustration of a budget chart with coins and a magnifying glass",
    tags: ["Dashboard X", "Smart Moves & Quick Hacks", "Money tips"],
    href: "#",
  },
  {
    title: "Ditch the Clunky Spreadsheet: Level up your bank sync so your accounts actually talk to each other",
    art: "/assets/art-sync.png",
    alt: "Illustration of two arrows circling a dollar sign",
    tags: ["Dashboard X", "Smart Moves & Quick Hacks", "Money tips"],
    href: "#",
  },
  {
    title: "Less Drama, More Glam: We built the exact booking tools you asked for.",
    art: "/assets/art-calendar.png",
    alt: "Illustration of a calendar with a notification bell",
    tags: ["Bookflow", "Smart Moves & Quick Hacks", "Beauty Cheat Codes"],
    href: "#",
  },
];

/** ---- How I work ------------------------------------------------------ */

export const principles = [
  {
    title: "I use the thing first",
    body: "Every product starts with a business I know, sitting next to us while we build it.",
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
 *  Swap the "#" for your real profile URLs. Any entry left as "#" is
 *  rendered but marked as not-yet-linked for screen readers.
 * ---------------------------------------------------------------------- */

export const socials = [
  { name: "Facebook", href: "#", id: "facebook" },
  { name: "Instagram", href: "#", id: "instagram" },
  { name: "X", href: "#", id: "x" },
  { name: "YouTube", href: "#", id: "youtube" },
  { name: "LinkedIn", href: "#", id: "linkedin" },
  { name: "Discord", href: "#", id: "discord" },
] as const;

/** ---- Derived links --------------------------------------------------- */

export const mailtoHref = `mailto:${site.contact.email}?subject=${encodeURIComponent(
  site.contact.emailSubject
)}`;

export const whatsappHref = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
  site.contact.whatsappMessage
)}`;
