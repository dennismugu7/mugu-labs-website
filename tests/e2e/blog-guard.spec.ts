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

test("the five posts in content/blog parse, and are all drafts for now", () => {
  const posts = loadPosts({ dir: BLOG_DIR, publishDrafts: false });
  expect(posts).toHaveLength(5);
  expect(posts.every((p) => p.draft)).toBe(true);
  expect(posts.every((p) => p.author === "Mugu Labs team")).toBe(true);
});
