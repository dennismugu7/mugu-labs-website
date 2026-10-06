/**
 * The blog: Markdown posts in content/blog/, read at build time.
 *
 * Server-only (it reads the file system): pages, the sitemap and
 * next.config.ts import it; client components get what they need as props.
 *
 * A post is published when its frontmatter says `draft: false`. Only
 * published posts are built, listed or put in the sitemap, and a published
 * post may not still carry an editor's note ("[Dennis: …]"): the build stops.
 *
 * A post may have a cover: `cover`, a site path under public/ such as
 * "/assets/blog/x.webp", with `coverAlt`; both or neither. The image's real
 * size is read at build time, for <img> and the share tags.
 */
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { imageSize } from "./image-size";
import { features, products } from "./site";
import { testOverride } from "./test-override";

export const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** An editor's note left in a draft for the owner to replace. */
const PLACEHOLDER = "[Dennis";

export type BlogPost = {
  title: string;
  slug: string;
  /** YYYY-MM-DD */
  date: string;
  excerpt: string;
  tags: string[];
  /** A product slug from lib/site.ts, or "" for none. */
  product: string;
  author: string;
  draft: boolean;
  /** The cover image, if the post has one. */
  cover?: Cover;
  /** The Markdown body, without the frontmatter. */
  body: string;
  file: string;
};

export type Cover = {
  /** A site path, e.g. "/assets/blog/x.webp". */
  src: string;
  alt: string;
  width: number;
  height: number;
};

/* ------------------------------------------------------------- parsing */

const FIELDS = ["title", "slug", "date", "excerpt", "tags", "product", "author", "draft"] as const;

/**
 * Frontmatter is a fenced block of `key: value` lines, each value written as
 * JSON (quoted strings, ["arrays"], true/false). Strict on purpose: a typo
 * stops the build instead of quietly publishing something odd.
 */
export function parsePost(source: string, file: string, publicDir = PUBLIC_DIR): BlogPost {
  const match = source.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: no frontmatter block`);

  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!kv) throw new Error(`${file}: frontmatter line "${line}" is not key: value`);
    try {
      data[kv[1]] = JSON.parse(kv[2]);
    } catch {
      throw new Error(`${file}: frontmatter "${kv[1]}" is not a JSON value: ${kv[2]}`);
    }
  }

  for (const key of FIELDS) if (!(key in data)) throw new Error(`${file}: frontmatter is missing "${key}"`);
  const str = (k: string) => {
    if (typeof data[k] !== "string") throw new Error(`${file}: "${k}" must be a string`);
    return data[k] as string;
  };
  if (!Array.isArray(data.tags) || data.tags.some((t) => typeof t !== "string" || !t.trim()))
    throw new Error(`${file}: "tags" must be a list of names`);
  if (typeof data.draft !== "boolean") throw new Error(`${file}: "draft" must be true or false`);

  const post: BlogPost = {
    title: str("title"),
    slug: str("slug"),
    date: str("date"),
    excerpt: str("excerpt"),
    tags: data.tags as string[],
    product: str("product"),
    author: str("author"),
    draft: data.draft,
    body: match[2],
    file,
  };

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(post.slug)) throw new Error(`${file}: slug "${post.slug}" is not a-z0-9-`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(Date.parse(post.date)))
    throw new Error(`${file}: date "${post.date}" is not YYYY-MM-DD`);
  if (post.product && !products.some((p) => p.slug === post.product))
    throw new Error(`${file}: product "${post.product}" is not in lib/site.ts`);

  if ("cover" in data || "coverAlt" in data) {
    if (!("cover" in data && "coverAlt" in data))
      throw new Error(`${file}: "cover" and "coverAlt" go together; one is missing`);
    const src = str("cover");
    const alt = str("coverAlt").trim();
    if (!/^\/[\w./-]+\.(webp|png|jpe?g)$/i.test(src) || src.includes(".."))
      throw new Error(`${file}: cover "${src}" must be a site path to a .webp, .png or .jpg, like "/assets/blog/x.webp"`);
    if (!alt) throw new Error(`${file}: "coverAlt" must describe the cover`);
    const onDisk = path.join(publicDir, src);
    if (!fs.existsSync(onDisk)) throw new Error(`${file}: cover "${src}" is not in public/`);
    post.cover = { src, alt, ...imageSize(onDisk) };
  }
  return post;
}

/** Drop the editor's notes ("> **[Dennis: …]**" lines). Test builds only. */
function withoutPlaceholders(body: string): string {
  return body
    .split(/\r?\n/)
    .filter((line) => !line.includes(PLACEHOLDER))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Throws if a post that would be published still has an editor's note. */
export function assertPublishable(posts: BlogPost[]): void {
  const unfinished = posts.filter((p) => !p.draft && (p.body + p.title + p.excerpt).includes(PLACEHOLDER));
  if (unfinished.length) {
    throw new Error(
      `Published posts still contain "${PLACEHOLDER}" notes: ${unfinished.map((p) => p.file).join(", ")}. ` +
        "Replace the note, or set the post back to draft: true."
    );
  }
}

/* ------------------------------------------------------------- loading */

type LoadOptions = { dir?: string; publishDrafts?: boolean };

/** Every post in the folder, parsed (drafts included unless published). */
export function loadPosts({ dir = BLOG_DIR, publishDrafts = !!testOverride.publishDrafts }: LoadOptions = {}): BlogPost[] {
  if (!fs.existsSync(dir)) return [];
  const posts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parsePost(fs.readFileSync(path.join(dir, f), "utf8"), path.join(path.basename(dir), f)))
    // The test override publishes the drafts, without their editor's notes.
    .map((p) => (publishDrafts && p.draft ? { ...p, draft: false, body: withoutPlaceholders(p.body) } : p));

  const slugs = new Set<string>();
  for (const p of posts) {
    if (slugs.has(p.slug)) throw new Error(`Two posts share the slug "${p.slug}"`);
    slugs.add(p.slug);
  }
  return posts;
}

let cache: BlogPost[] | null = null;

/** Published posts, newest first. Stops the build on an unfinished one. */
export function publishedPosts(): BlogPost[] {
  if (!cache) {
    const all = loadPosts();
    assertPublishable(all);
    cache = all.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  }
  return cache;
}

/**
 * The blog shows (pages, nav and footer links, the home section, sitemap
 * entries) only with features.blog on AND at least one published post.
 */
export function blogVisible(): boolean {
  // Load (and so check) the posts first, whatever the flag says: an
  // unfinished published post must stop the build even while the blog is off.
  const published = publishedPosts();
  return blogShows({ ...features, ...testOverride.features }.blog, published.length);
}

/** The rule itself: the flag on AND something published. */
export function blogShows(flag: boolean | undefined, publishedCount: number): boolean {
  return !!flag && publishedCount > 0;
}

export function findPost(slug: string): BlogPost | undefined {
  return publishedPosts().find((p) => p.slug === slug);
}

/* ------------------------------------------------------------- display */

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Every tag on a published post, by slug, with its display name. */
export function allTags(): { slug: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const post of publishedPosts()) for (const t of post.tags) if (!seen.has(tagSlug(t))) seen.set(tagSlug(t), t);
  return [...seen].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
}

export function postsTagged(slug: string): BlogPost[] {
  return publishedPosts().filter((p) => p.tags.some((t) => tagSlug(t) === slug));
}

/** About 200 words a minute, rounded up. */
export function readingMinutes(post: BlogPost): number {
  const words = post.body.replace(/[#>*_`[\]()|-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "6 October 2026" */
export function formatDate(date: string): string {
  return DATE.format(new Date(`${date}T00:00:00Z`));
}

/** The post's body as HTML. The Markdown is ours, from the repo. */
export function renderBody(post: BlogPost): string {
  return marked.parse(post.body, { async: false, gfm: true });
}
