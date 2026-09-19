import { ArrowRight } from "./icons";
import { reveal } from "./reveal";
import { posts, site } from "../lib/site";

export default function Journal() {
  const blog = site.blogUrl;
  const external = blog.startsWith("http");

  return (
    <section className="section" id="journal" aria-labelledby="journal-title">
      <div className="shell">
        <div className="journal__head">
          <h2 id="journal-title" {...reveal(0, "section-title")}>
            Learn more at mugu labs blog
          </h2>
        </div>

        <ul className="grid-3">
          {posts.map((post, i) => {
            const body = (
              <>
                <span className="post__art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.art} alt={post.alt} loading="lazy" />
                </span>

                <h3 className="post__title">{post.title}</h3>

                <ul className="tags">
                  {post.tags.map((tag) => (
                    <li className="tag" key={tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </>
            );

            return (
              <li key={post.title} {...reveal(i * 110)}>
                {post.href ? (
                  <a className="card card--hover post post--link" href={post.href}>
                    {body}
                  </a>
                ) : (
                  /* No post to go to yet: the same card as plain content (D20). */
                  <article className="card post">{body}</article>
                )}
              </li>
            );
          })}
        </ul>

        <div {...reveal(0, "journal__foot")}>
          {blog ? (
            <a className="btn btn--navy" href={blog} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
              more at mugu labs blog
              <ArrowRight className="btn__arrow" />
            </a>
          ) : (
            /* The blog does not exist yet: same pill, not a link (D20). */
            <span className="btn btn--navy btn--placeholder">
              more at mugu labs blog
              <span className="sr-only"> — coming soon</span>
              <ArrowRight className="btn__arrow" />
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
