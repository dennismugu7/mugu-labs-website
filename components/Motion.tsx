"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMotion } from "../lib/motion";

/**
 * Starts the scroll/reveal layer, and starts it again on every route change.
 *
 * This lives in the root layout, which stays mounted while the visitor moves
 * between pages, so a mount-only effect would only ever see the first page's
 * elements — every page reached by a link or by Back would keep its reveals
 * hidden. Keying on the pathname gives each page a fresh run.
 */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanup = initMotion();
    const restoring = performance.now() - lastPopState < 1000;

    /* A link to /#section from another page: the section only exists now that
       the new page has mounted, so land on it here. Back/forward is left to
       the browser's own scroll restoration. */
    const id = decodeURIComponent(window.location.hash.slice(1));
    const stopLanding = id && !restoring ? landOn(id) : () => {};

    return () => {
      stopLanding();
      cleanup();
    };
  }, [pathname]);

  return null;
}

const LANDING_MS = 1000;
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * Put the section under the fixed nav, and keep it there for a moment.
 *
 * Content above it can still change height for a few frames after the new
 * page mounts, and Next starts its own smooth scroll to the hash, aimed at
 * where the section was when it started. Either can leave the visitor short
 * of the section. Re-pin every frame for LANDING_MS, unless the visitor
 * takes over by scrolling, tapping or pressing a key.
 */
function landOn(id: string): () => void {
  const deadline = performance.now() + LANDING_MS;
  let frame = 0;

  const stop = () => {
    window.cancelAnimationFrame(frame);
    USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stop));
  };
  USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));

  const pin = () => {
    const el = document.getElementById(id);
    if (!el || performance.now() > deadline) return stop();

    const top = el.getBoundingClientRect().top;
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
    // Near the end of the page the section can't rise all the way; leave it.
    if (Math.abs(top - margin) > 2 && !(atEnd && top > margin)) {
      el.scrollIntoView({ block: "start", behavior: "instant" });
    }
    frame = window.requestAnimationFrame(pin);
  };
  frame = window.requestAnimationFrame(pin);

  return stop;
}

/* When the last history traversal happened. A route change right after one
   is Back/forward; anything else is a link. */
let lastPopState = -Infinity;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopState = performance.now();
  });
}
