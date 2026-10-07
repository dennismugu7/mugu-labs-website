import { expect, test } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  allTags,
  assertPublishable,
  BLOG_DIR,
  isPublished,
  livePosts,
  loadPosts,
  parsePost,
  postsTagged,
  todayInNairobi,
} from "../../lib/blog";

/*
 * The blog's build-time rules, tested against lib/blog.ts directly (no
 * browser): a published post with an editor's note stops the build; drafts
 * may carry one; the frontmatter is strict.
 */
test.skip(({ isMobile }) => isMobile, "no browser involved");

const post = (frontmatter: Record<string, unknown>, body = "Body text.") =>
  `---\n${Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n")}\n---\n\n${body}\n`;

const base = {
  title: "A post",
  slug: "a-post",
  date: "2026-10-06",
  excerpt: "An excerpt.",
  tags: ["Money tips"],
  product: "",
  author: "Mugu Labs team",
  draft: true,
};

test('a published post with a "[Dennis" note stops the build', () => {
  const unfinished = parsePost(post({ ...base, draft: false }, "> **[Dennis: add a story here.]**"), "x.md");
  expect(() => assertPublishable([unfinished])).toThrow(/\[Dennis/);
});

test("a draft may carry the note; a finished published post is fine", () => {
  const draft = parsePost(post(base, "> **[Dennis: add a story here.]**"), "draft.md");
  const finished = parsePost(post({ ...base, slug: "done", draft: false }, "A real story."), "done.md");
  expect(() => assertPublishable([draft, finished])).not.toThrow();
});

test("the guard runs on what is actually in a folder", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-"));
  try {
    fs.writeFileSync(path.join(dir, "a.md"), post({ ...base, draft: false }, "Hi\n\n> [Dennis: fill me in]"));
    expect(() => assertPublishable(loadPosts({ dir, publishDrafts: false }))).toThrow(/a\.md/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("frontmatter is strict", () => {
  const { tags: _tags, ...withoutTags } = base;
  void _tags;
  expect(() => parsePost(post(withoutTags), "m.md")).toThrow(/missing "tags"/);
  expect(() => parsePost(post({ ...base, draft: "no" }), "d.md")).toThrow(/draft/);
  expect(() => parsePost(post({ ...base, product: "nope" }), "p.md")).toThrow(/product "nope"/);
  expect(() => parsePost(post({ ...base, date: "6 Oct" }), "t.md")).toThrow(/date/);
});

/* The publishing schedule, against the posts as they are in content/blog. */
const SCHEDULE: Record<string, string[]> = {
  "2026-10-06": [
    "why-we-build-small-apps",
    "meet-the-team",
    "december-plan-written-in-october",
    "15-minute-money-check-in",
    "pay-a-different-account",
  ],
  "2026-10-12": ["supporting-family-without-going-broke"],
  "2026-10-19": ["deposits-without-the-awkwardness"],
  "2026-10-26": ["rebook-before-they-leave"],
  "2026-11-02": ["your-bank-statement-is-talking"],
  "2026-11-09": ["get-your-shop-festive-ready"],
  "2026-11-16": ["win-back-quiet-regulars"],
  "2026-11-23": ["from-dm-chaos-to-an-order-list"],
  "2026-11-30": ["building-for-a-five-year-old-android"],
};

test("the 13 posts in content/blog parse, none a draft, each on its date", () => {
  const posts = loadPosts({ dir: BLOG_DIR, publishDrafts: false });
  expect(posts).toHaveLength(13);
  expect(posts.every((p) => !p.draft)).toBe(true);
  expect(posts.every((p) => p.author === "Mugu Labs team")).toBe(true);
  const dates = Object.fromEntries(posts.map((p) => [p.slug, p.date]));
  expect(dates).toEqual(
    Object.fromEntries(Object.entries(SCHEDULE).flatMap(([date, slugs]) => slugs.map((s) => [s, date])))
  );
});

test.describe("scheduled posts (a fixed today, never the real one)", () => {
  const all = () => loadPosts({ dir: BLOG_DIR, publishDrafts: false });
  const slugsOn = (today: string) => livePosts(all(), today).map((p) => p.slug);

  test("today is Nairobi's: the day turns at 21:00 UTC", () => {
    expect(todayInNairobi(new Date("2026-10-11T20:59:59Z"))).toBe("2026-10-11");
    expect(todayInNairobi(new Date("2026-10-11T21:00:00Z"))).toBe("2026-10-12");
    // The daily rebuild's 21:05 UTC is five minutes into the new day there.
    expect(todayInNairobi(new Date("2026-10-11T21:05:00Z"))).toBe("2026-10-12");
    expect(todayInNairobi(new Date("2026-12-31T21:30:00Z"))).toBe("2027-01-01");
  });

  test("a post is out on its date, not the day before; a draft never", () => {
    const p = parsePost(post({ ...base, date: "2026-10-12", draft: false }), "s.md");
    expect(isPublished(p, "2026-10-11")).toBe(false);
    expect(isPublished(p, "2026-10-12")).toBe(true);
    expect(isPublished(p, "2026-10-13")).toBe(true);
    expect(isPublished({ ...p, draft: true }, "2027-01-01")).toBe(false);
  });

  test("which posts are out, by date, newest first", () => {
    expect(slugsOn("2026-10-05")).toEqual([]);
    expect(slugsOn("2026-10-06").sort()).toEqual([...SCHEDULE["2026-10-06"]].sort());
    expect(slugsOn("2026-10-11")).toHaveLength(5);
    expect(slugsOn("2026-10-12")[0]).toBe("supporting-family-without-going-broke");
    expect(slugsOn("2026-10-20")).toHaveLength(7);
    expect(slugsOn("2026-11-29")).toHaveLength(12);
    expect(slugsOn("2026-11-30")).toHaveLength(13);
    const dates = livePosts(all(), "2026-11-30").map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("a tag whose only posts are scheduled has no page, and lists none of them", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-"));
    try {
      fs.writeFileSync(path.join(dir, "now.md"), post({ ...base, slug: "now", draft: false, tags: ["Money tips"] }));
      fs.writeFileSync(
        path.join(dir, "later.md"),
        post({ ...base, slug: "later", date: "2026-11-01", draft: false, tags: ["Money tips", "Coming soon"] })
      );
      const live = livePosts(loadPosts({ dir, publishDrafts: false }), "2026-10-20");
      expect(live.map((p) => p.slug)).toEqual(["now"]);
      expect(allTags(live).map((t) => t.name)).toEqual(["Money tips"]);
      expect(postsTagged("money-tips", live).map((p) => p.slug)).toEqual(["now"]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  test("a date may carry a time in Nairobi; date-only still works", () => {
    const timed = parsePost(post({ ...base, date: "2026-10-06T09:00" }), "t.md");
    expect([timed.date, timed.time, timed.published]).toEqual(["2026-10-06", "09:00", "2026-10-06T09:00:00+03:00"]);
    const plain = parsePost(post(base), "p.md");
    expect([plain.date, plain.time, plain.published]).toEqual(["2026-10-06", undefined, "2026-10-06"]);
    for (const bad of ["2026-10-06T9:00", "2026-10-06T24:00", "2026-10-06T09:60", "2026-10-06 09:00", "2026-10-06T09:00:00"])
      expect(() => parsePost(post({ ...base, date: bad }), "b.md"), bad).toThrow(/date/);
    // The time orders the day; the post is out from the start of its date.
    expect(isPublished({ ...timed, draft: false }, "2026-10-06")).toBe(true);
    expect(isPublished({ ...timed, draft: false }, "2026-10-05")).toBe(false);
  });

  test("launch day, newest first by time", () => {
    expect(slugsOn("2026-10-06")).toEqual([
      "december-plan-written-in-october",
      "meet-the-team",
      "why-we-build-small-apps",
      "15-minute-money-check-in",
      "pay-a-different-account",
    ]);
    // A later date still comes first, time or no time.
    expect(slugsOn("2026-10-12")[0]).toBe("supporting-family-without-going-broke");
  });

  test("a scheduled post's editor's note stops the build now, not on its date", () => {
    const later = parsePost(post({ ...base, date: "2099-01-01", draft: false }, "> [Dennis: later]"), "l.md");
    expect(() => assertPublishable([later])).toThrow(/l\.md/);
  });
});

test.describe("covers", () => {
  // A public/ folder with one real 16:9 image in it (the smallest cover).
  let publicDir = "";
  test.beforeAll(() => {
    publicDir = fs.mkdtempSync(path.join(os.tmpdir(), "public-"));
    fs.mkdirSync(path.join(publicDir, "assets", "blog"), { recursive: true });
    fs.copyFileSync(
      path.join(process.cwd(), "public", "assets", "blog", "win-back-cover.webp"),
      path.join(publicDir, "assets", "blog", "c.webp")
    );
  });
  test.afterAll(() => fs.rmSync(publicDir, { recursive: true, force: true }));

  const withCover = (extra: Record<string, unknown>) => post({ ...base, ...extra });

  test("optional: a post without one has none", () => {
    expect(parsePost(post(base), "n.md", publicDir).cover).toBeUndefined();
  });

  test("with both fields, the cover carries its real size", () => {
    const p = parsePost(withCover({ cover: "/assets/blog/c.webp", coverAlt: "A comb and a phone" }), "c.md", publicDir);
    expect(p.cover).toEqual({ src: "/assets/blog/c.webp", alt: "A comb and a phone", width: 969, height: 545 });
  });

  test("the rules", () => {
    const parse = (extra: Record<string, unknown>) => () => parsePost(withCover(extra), "r.md", publicDir);
    expect(parse({ cover: "/assets/blog/c.webp" })).toThrow(/go together/);
    expect(parse({ coverAlt: "Alt" })).toThrow(/go together/);
    expect(parse({ cover: "/assets/blog/c.webp", coverAlt: "  " })).toThrow(/describe the cover/);
    expect(parse({ cover: "assets/blog/c.webp", coverAlt: "Alt" })).toThrow(/site path/);
    expect(parse({ cover: "/assets/../secret.webp", coverAlt: "Alt" })).toThrow(/site path/);
    expect(parse({ cover: "/assets/blog/c.gif", coverAlt: "Alt" })).toThrow(/site path/);
    expect(parse({ cover: "/assets/blog/missing.webp", coverAlt: "Alt" })).toThrow(/not in public/);
  });

  test("the posts' own covers are all there, 16:9, with alt text", () => {
    const posts = loadPosts({ dir: BLOG_DIR, publishDrafts: false });
    const covered = posts.filter((p) => p.cover);
    expect(covered).toHaveLength(8);
    for (const p of covered) {
      expect(p.cover!.alt.length, p.slug).toBeGreaterThan(10);
      expect(Math.abs(p.cover!.width / p.cover!.height - 16 / 9), p.slug).toBeLessThan(0.01);
    }
  });
});
