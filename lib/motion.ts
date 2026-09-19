/**
 * The whole motion layer — no animation library, ~2KB.
 *
 * Three jobs:
 *   1. reveals      — elements fade/rise in once, via IntersectionObserver.
 *   2. scroll vars  — a single rAF-throttled pass that writes CSS custom
 *                     properties; all the actual animation is done by CSS.
 *   3. reduced motion — if the visitor asked for less, none of it runs.
 */

const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v);

type Cleanup = () => void;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---------------------------------------------------------------- reveals */

function initReveals(): Cleanup {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (!nodes.length) return () => {};

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  nodes.forEach((n) => observer.observe(n));
  return () => observer.disconnect();
}

/* ------------------------------------------------------------ scroll vars */

function initScrollVars(): Cleanup {
  const root = document.documentElement;
  const statements = Array.from(document.querySelectorAll<HTMLElement>("[data-statement]"));
  const drifters = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]"));
  const tintAnchor = document.querySelector<HTMLElement>("[data-tint-anchor]");
  const nav = document.querySelector<HTMLElement>("[data-nav]");

  let frame = 0;
  let stuck = false;

  const read = () => {
    frame = 0;
    const vh = window.innerHeight || 1;
    const y = window.scrollY || window.pageYOffset || 0;

    /* Overall page progress, 0 → 1 */
    const scrollable = Math.max(1, document.body.scrollHeight - vh);
    root.style.setProperty("--scroll", (y / scrollable).toFixed(4));

    /* Backdrop hue change, anchored to a real section rather than a guess */
    if (tintAnchor) {
      const top = tintAnchor.getBoundingClientRect().top;
      root.style.setProperty("--tint", clamp(1 - top / vh).toFixed(4));
    }

    /* Nav background once we're off the hero */
    if (nav) {
      const next = y > 24;
      if (next !== stuck) {
        stuck = next;
        nav.classList.toggle("is-stuck", next);
      }
    }

    /* Pinned statements */
    for (const el of statements) {
      const rect = el.getBoundingClientRect();
      const range = Math.max(1, el.offsetHeight - vh);
      const p = clamp(-rect.top / range);
      const enter = clamp(p / 0.26);
      const exit = clamp((p - 0.74) / 0.26);
      el.style.setProperty("--enter", enter.toFixed(4));
      el.style.setProperty("--exit", exit.toFixed(4));
      el.style.setProperty("--vis", (enter * (1 - exit)).toFixed(4));
    }

    /* Gentle parallax drift */
    for (const el of drifters) {
      const rect = el.getBoundingClientRect();
      const centre = rect.top + rect.height / 2;
      el.style.setProperty("--drift", clamp((centre - vh / 2) / vh, -1, 1).toFixed(4));
    }
  };

  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(read);
  };

  read();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

/* ------------------------------------------------------------------ entry */

export function initMotion(): Cleanup {
  document.documentElement.classList.remove("no-js");

  if (prefersReducedMotion()) {
    document
      .querySelectorAll<HTMLElement>("[data-reveal]")
      .forEach((n) => n.classList.add("is-in"));
    return () => {};
  }

  const cleanups = [initReveals(), initScrollVars()];
  return () => cleanups.forEach((fn) => fn());
}
