import Link from "next/link";
import { ArrowRight } from "./icons";
import { reveal } from "./reveal";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="shell hero__inner">
        <h1 id="hero-title" {...reveal(90, "display hero__title")}>
          Neat apps with a human touch
        </h1>

        <p {...reveal(220, "lead hero__lead")}>
          I pick one real problem at a time, ship something usable, and keep working on it long
          after launch. No agency retainers, no discovery decks.
        </p>

        <div {...reveal(330)}>
          <Link className="btn btn--ghost btn--block-sm" href="#contact">
            Work with me
            <ArrowRight className="btn__arrow" />
          </Link>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span className="hero__scroll-rail" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
