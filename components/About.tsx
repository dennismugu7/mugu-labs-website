import { GitHubIcon } from "./icons";
import { reveal } from "./reveal";
import { site, team } from "../lib/site";

export default function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="shell about">
        <div>
          <h2 id="about-title" {...reveal(0, "section-title about__title")}>
            Made by humans
          </h2>

          <div {...reveal(120, "about__card")}>
            <p>{site.bio}</p>
          </div>

          <ul className="team" aria-label="The team">
            {team.map((member, i) => (
              <li key={member.name ?? member.role} {...reveal(220 + i * 80, "author")}>
                {member.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="author__avatar"
                    src={member.avatar}
                    alt={`${member.name ?? member.role}, ${member.role} at ${site.name}`}
                    width={62}
                    height={62}
                    loading="lazy"
                  />
                ) : (
                  <span className="author__avatar author__monogram" aria-hidden="true">
                    {member.monogram}
                  </span>
                )}
                <div>
                  {member.name ? <p className="author__name">{member.name}</p> : null}
                  <p className={member.name ? "author__role" : "author__name"}>{member.role}</p>
                  {member.github ? (
                    <a
                      className="author__handle"
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <GitHubIcon />@{member.github}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <figure data-drift {...reveal(180, "about__art")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/art-tape.png"
            alt="A hand pulling a tape measure across a button, measuring an interface"
            width={781}
            height={412}
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
