import Link from "next/link";
import PostCover from "./PostCover";
import { formatDate, readingMinutes, tagSlug, type BlogPost } from "../lib/blog";

type Props = {
  post: BlogPost;
  /** The card's heading level: h2 on the blog's own pages, h3 on home. */
  level?: "h2" | "h3";
  /** The first card on a page, in view on arrival: its cover loads at once. */
  eager?: boolean;
};

/** A post on the blog index, a tag page or the home page's blog section.
    With a cover, the cover sits along the card's top; without, as before. */
export default function PostCard({ post, level = "h2", eager = false }: Props) {
  const Title = level;
  return (
    <article className={post.cover ? "card post-card post-card--cover" : "card post-card"}>
      {post.cover ? <PostCover cover={post.cover} className="post-card__cover" eager={eager} decorative /> : null}
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
