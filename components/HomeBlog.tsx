import Link from "next/link";
import PostCard from "./PostCard";
import { ArrowRight } from "./icons";
import { reveal } from "./reveal";
import type { BlogPost } from "../lib/blog";

/** The home page's blog section: the latest posts and a way to the rest. */
export default function HomeBlog({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="section" id="blog" aria-labelledby="blog-title">
      <div className="shell">
        <h2 id="blog-title" {...reveal(0, "section-title home-blog__title")}>
          From the blog
        </h2>

        <ul className="home-blog__list">
          {posts.map((post, i) => (
            <li key={post.slug} {...reveal(i * 110)}>
              <PostCard post={post} level="h3" />
            </li>
          ))}
        </ul>

        <div {...reveal(0, "home-blog__more")}>
          <Link className="btn btn--ghost" href="/blog/">
            More on the blog
            <ArrowRight className="btn__arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
