import Link from "next/link";
import { formatDate, readingMinutes, tagSlug, type BlogPost } from "../lib/blog";

type Props = {
  post: BlogPost;
  /** The card's heading level: h2 on the blog's own pages, h3 on home. */
  level?: "h2" | "h3";
};

/** A post on the blog index, a tag page or the home page's blog section. */
export default function PostCard({ post, level = "h2" }: Props) {
  const Title = level;
  return (
    <article className="card post-card">
      <p className="post-meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden="true"> · </span>
        {readingMinutes(post)} min read
      </p>
      <Title className="post-card__title">
        <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
      </Title>
      <p className="post-card__excerpt">{post.excerpt}</p>
      <ul className="tags" aria-label="Tags">
        {post.tags.map((tag) => (
          <li key={tag}>
            <Link className="tag tag--link" href={`/blog/tag/${tagSlug(tag)}/`}>
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
