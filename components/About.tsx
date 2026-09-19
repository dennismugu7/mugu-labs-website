import { GitHubIcon } from "./icons";
import { reveal } from "./reveal";
import { site } from "../lib/site";

export default function About() {
  const { author } = site;

  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="shell about">
        <div>
          <h2 id="about-title" {...reveal(0, "section-title about__title")}>
            Made by a human
          </h2>

          <div {...reveal(120, "about__card")}>
            <p>{author.bio}</p>
          </div>

          <div {...reveal(220, "author")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="author__avatar"
              src={author.avatar}
              alt={`${author.name}, ${author.role.toLowerCase()} at ${site.name}`}
              width={62}
              height={62}
              loading="lazy"
            />
            <div>
              <p className="author__name">{author.name}</p>
              <p className="author__role">{author.role}</p>
              <a
                className="author__handle"
                href={author.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <GitHubIcon />@{author.github}
              </a>
            </div>
          </div>
        </div>

        <figure data-drift {...reveal(180, "about__art")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/art-tape.png"
            alt="A hand pulling a tape measure across a button, measuring an interface"
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
