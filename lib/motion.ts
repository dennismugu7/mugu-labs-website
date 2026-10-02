/**
 * The whole motion layer — no animation library, ~2KB.
 *
 * Three jobs:
 *   1. reveals      — elements fade/rise in once, via IntersectionObserver.
 *   2. scroll vars  — a single rAF-throttled pass that writes CSS custom
 *                     properties; all the actual animation is done by CSS.
 *   3. reduced motion — if the visitor asked for less, none of it runs.
 *
 * Reveals only hide content while <html> carries `js-motion`. An inline
 * script in the layout's <head> adds it before first paint and takes it away
 * again if this file hasn't started within MOTION_FALLBACK_MS, so a page whose
 * JS fails or crawls in still shows everything (see motionBootScript).
 *
 * initMotion is run again on every route change (components/Motion.tsx), so
 * everything here is queried fresh each time and fully torn down by the
 * returned cleanup.
 */

const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v);

type Cleanup = () => void;

const MOTION_CLASS = "js-motion";
const MOTION_FALLBACK_MS = 3000;

/** "pending" until initMotion runs, "ready" after, "fallback" if it ran late. */
type MotionState = "pending" | "ready" | "fallback";

declare global {
  interface Window {
    __muguMotion?: MotionState;
  }
}

/**
 * Inlined into <head> by app/layout.tsx. Plain ES5, no imports: it runs
 * before any bundle has loaded.
 */
export const motionBootScript = `(function(){var d=document.documentElement;if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("${MOTION_CLASS}");window.__muguMotion="pending";setTimeout(function(){if(window.__muguMotion==="pending"){window.__muguMotion="fallback";d.classList.remove("${MOTION_CLASS}");}},${MOTION_FALLBACK_MS});})();`;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---------------------------------------------------------------- reveals */

function initReveals(): Cleanup {
  /* Already-revealed nodes (the footer, which lives in the layout and
     survives navigation) stay as they are. */
  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
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
    { rootMargin: "0px 0px -5% 0px", threshold: 0.05 }
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
  const tintRelease = document.querySelector<HTMLElement>("[data-tint-release]");
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  /* Statements pin from this width up; below it they scroll normally (CSS). */
  const pinQuery = window.matchMedia("(min-width: 768px)");

  let frame = 0;
  /* The nav outlives this run; start from what it shows, not from false. */
  let stuck = nav?.classList.contains("is-stuck") ?? false;

  const read = () => {
    frame = 0;
    const vh = window.innerHeight || 1;
    const y = window.scrollY || window.pageYOffset || 0;

    /* Overall page progress, 0 → 1 */
    const scrollable = Math.max(1, document.body.scrollHeight - vh);
    root.style.setProperty("--scroll", (y / scrollable).toFixed(4));

    /* Backdrop hue change, anchored to real sections rather than a guess:
       ramps to violet as the anchor enters, holds, and is back to blue once
       the release section is halfway up the viewport (D5). */
    if (tintAnchor) {
      const top = tintAnchor.getBoundingClientRect().top;
      let tint = clamp(1 - top / vh);
      if (tintRelease) {
        const releaseTop = tintRelease.getBoundingClientRect().top;
        tint *= 1 - clamp((vh - releaseTop) / (vh * 0.5));
      }
      root.style.setProperty("--tint", tint.toFixed(4));
    } else {
      /* A page without the anchor (a product page) must not keep the violet
         it inherited from wherever the visitor scrolled before navigating. */
      root.style.setProperty("--tint", "0");
    }

    /* Nav background once we're off the hero */
    if (nav) {
      const next = y > 24;
      if (next !== stuck) {
        stuck = next;
        nav.classList.toggle("is-stuck", next);
      }
    }

    /* Statements. From 768px they pin for one viewport: the text fades in
       while the section rises into view, holds while pinned, and fades out as
       the section leaves, so the screen is never left blank around it. Below
       768px they are not pinned and only fade in as the text arrives. */
    const pinned = pinQuery.matches;
    for (const el of statements) {
      const rect = el.getBoundingClientRect();
      let enter: number;
      let exit: number;
      if (pinned) {
        enter = clamp((vh - rect.top) / (vh * 0.75));
        exit = clamp((vh - rect.bottom) / (vh * 0.75));
      } else {
        const text = el.querySelector<HTMLElement>(".statement__text") ?? el;
        enter = clamp((vh - text.getBoundingClientRect().top) / (vh * 0.35));
        exit = 0;
      }
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
  const root = document.documentElement;
  const late = window.__muguMotion === "fallback";
  window.__muguMotion = late ? "fallback" : "ready";

  if (prefersReducedMotion()) {
    root.classList.remove(MOTION_CLASS);
    return () => {};
  }

  /* The fallback already showed everything; don't hide it again now. When
     there was no boot script at all (the preview harness), switch on here. */
  if (late) return initScrollVars();
  root.classList.add(MOTION_CLASS);

  const cleanups = [initReveals(), initScrollVars()];
  return () => cleanups.forEach((fn) => fn());
}
