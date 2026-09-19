import { ArrowRight } from "./icons";
import { reveal } from "./reveal";
import { posts, site } from "../lib/site";

export default function Journal() {
  const external = site.blogUrl.startsWith("http");

  return (
    <section className="section" id="journal" aria-labelledby="journal-title">
      <div className="shell">
        <div className="journal__head">
          <h2 id="journal-title" {...reveal(0, "section-title")}>
            Learn more at mugu labs blog
          </h2>
        </div>

        <ul className="grid-3">
          {posts.map((post, i) => (
            <li key={post.title} {...reveal(i * 110)}>
              <a className="card card--hover post" href={post.href}>
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
              </a>
            </li>
          ))}
        </ul>

        <div {...reveal(0, "journal__foot")}>
          <a
            className="btn btn--navy"
            href={site.blogUrl}
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          >
            more at mugu labs blog
            <ArrowRight className="btn__arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
