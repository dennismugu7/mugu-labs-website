import { expect, test } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assertPublishable, BLOG_DIR, loadPosts, parsePost } from "../../lib/blog";

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

test("the 13 posts in content/blog parse, and are all drafts for now", () => {
  const posts = loadPosts({ dir: BLOG_DIR, publishDrafts: false });
  expect(posts).toHaveLength(13);
  expect(posts.every((p) => p.draft)).toBe(true);
  expect(posts.every((p) => p.author === "Mugu Labs team")).toBe(true);
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
