import { socialIcons } from "./icons";
import { reveal } from "./reveal";
import { socials } from "../lib/site";

export default function Connect() {
  return (
    <section className="section section--tight" id="connect" aria-labelledby="connect-title">
      <div className="shell connect">
        <h2 id="connect-title" {...reveal(0, "section-title")}>
          Let&rsquo;s stay connected
        </h2>

        <ul className="socials">
          {socials.map((social, i) => {
            const Icon = socialIcons[social.id];
            const className = `social social--${social.id}`;

            return (
              <li key={social.id} {...reveal(i * 70)}>
                {social.href ? (
                  <a className={className} href={social.href} aria-label={social.name} target="_blank" rel="noreferrer noopener">
                    {Icon ? <Icon /> : null}
                  </a>
                ) : (
                  /* No destination yet: the same tile, but not a link — nothing
                     to tab to, nothing to click, and it says so (D20). */
                  <span className={`${className} social--placeholder`} role="img" aria-label={`${social.name} — not linked yet`}>
                    {Icon ? <Icon /> : null}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
