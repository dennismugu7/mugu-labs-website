import Link from "next/link";
import { ArrowRight } from "./icons";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* The hero arrives on a CSS-only load animation, not the reveal
          observer: it is in view at load, so the observer would fire in the
          same frame as first paint and the text would simply appear (D17). */}
      <div className="shell hero__inner">
        <div className="hero__mask">
          <h1 id="hero-title" className="display hero__title hero__rise">
            Neat apps with a human touch
          </h1>
        </div>

        <p className="lead hero__lead hero__rise">
          I pick one real problem at a time, ship something usable, and keep working on it long
          after launch. No agency retainers, no discovery decks.
        </p>

        <div className="hero__cta hero__rise">
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
