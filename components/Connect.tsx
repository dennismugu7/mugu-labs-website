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
            const unlinked = social.href === "#";

            return (
              <li key={social.id} {...reveal(i * 70)}>
                <a
                  className={`social social--${social.id}`}
                  href={social.href}
                  aria-label={unlinked ? `${social.name} (coming soon)` : social.name}
                  aria-disabled={unlinked || undefined}
                  {...(unlinked ? {} : { target: "_blank", rel: "noreferrer noopener" })}
                >
                  {Icon ? <Icon /> : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
