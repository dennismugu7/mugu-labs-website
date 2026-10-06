import type { Metadata } from "next";
import PostCard from "../../components/PostCard";
import { reveal } from "../../components/reveal";
import { publishedPosts } from "../../lib/blog";
import { baseOpenGraph, baseTwitter } from "../../lib/metadata";
import { site } from "../../lib/site";

/*
 * page.blog.tsx: only a page while the blog is visible (next.config.ts adds
 * the "blog.tsx" extension then). Hidden, /blog/ is not built: a real 404.
 */

const description = "Notes from the studio: money, small business and the apps we're building.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog/" },
  openGraph: { ...baseOpenGraph, title: `Blog — ${site.name}`, description, url: "/blog/" },
  twitter: { ...baseTwitter, title: `Blog — ${site.name}`, description },
};

export default function BlogIndex() {
  const posts = publishedPosts();
  return (
    <section className="section blog-page" aria-labelledby="blog-title">
      <div className="shell shell--read">
        <h1 id="blog-title" {...reveal(0, "blog-page__title")}>
          Blog
        </h1>
        <p {...reveal(60, "blog-page__lead")}>{description}</p>
        <ul className="post-list">
          {posts.map((post, i) => (
            <li key={post.slug} {...reveal(Math.min(i, 3) * 80)}>
              <PostCard post={post} eager={i === 0} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
